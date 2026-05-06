import { v } from 'convex/values';
import { internal } from './_generated/api';
import type { Doc } from './_generated/dataModel';
import { internalAction, internalMutation, type MutationCtx } from './_generated/server';
import {
	emailDraft as emailDraftValidator,
	emailDraftPatch as emailDraftPatchValidator
} from './builderEmailValidators';
import {
	applyEmailDraftPatch,
	hasEmailDraftChanged,
	normalizeEmailDraft,
	type EmailDraft
} from './emailArtifact';
import {
	adaptEmailBuilderTemplate,
	applyEmailInitialAnswer,
	routeEmailBuilderRequest,
	streamCustomEmailBuilderTurn,
	streamEmailInitialQuestion,
	type EmailTemplateCandidate,
	type EmailTemplateGroupCandidate
} from './model';
import { isConversationActive } from './conversationCore';
import {
	ASSISTANT_STREAM_FLUSH_INTERVAL_MS,
	ASSISTANT_STREAM_FLUSH_MIN_CHARS,
	INITIAL_ANSWER_RETRY_MS,
	completeOperation,
	failOperation,
	getErrorMessage,
	getOperationById,
	insertOperation,
	normalizeAssistantText
} from './customEmailCore';

function toGroupCandidate(group: {
	slug: string;
	label: string;
	description: string;
	questionGuidance: string;
}): EmailTemplateGroupCandidate {
	return {
		slug: group.slug,
		label: group.label,
		description: group.description,
		questionGuidance: group.questionGuidance
	};
}

function toTemplateCandidate(template: {
	slug: string;
	groupSlug: string;
	label: string;
	description: string;
	matchSignals: string[];
	emailDraft: EmailDraft;
}): EmailTemplateCandidate {
	return {
		slug: template.slug,
		groupSlug: template.groupSlug,
		label: template.label,
		description: template.description,
		matchSignals: template.matchSignals,
		emailDraft: template.emailDraft
	};
}

async function failHiddenDraftState(
	ctx: MutationCtx,
	operation: Doc<'customEmailOperations'>,
	errorText: string,
	now: number
) {
	const run = await ctx.db.get(operation.runId);

	if (!run) {
		await ctx.db.patch(operation._id, {
			status: 'failed',
			errorText,
			updatedAt: now
		});
		return;
	}

	if (run.activeMessageOperationId) {
		const activeMessageOperation = await getOperationById(ctx, run.activeMessageOperationId);

		if (
			activeMessageOperation &&
			activeMessageOperation.status !== 'complete' &&
			activeMessageOperation.status !== 'failed'
		) {
			await ctx.db.patch(activeMessageOperation._id, {
				status: 'failed',
				errorText,
				updatedAt: now
			});

			if (activeMessageOperation.assistantMessageId) {
				await ctx.db.patch(activeMessageOperation.assistantMessageId, {
					status: 'failed',
					errorText,
					updatedAt: now
				});
			}
		}
	}

	await ctx.db.patch(operation._id, {
		status: 'failed',
		errorText,
		updatedAt: now
	});
	await ctx.db.patch(operation.runId, {
		phase: 'failed',
		workingArtifactStatus: 'failed',
		visibleArtifactStatus: run.visibleEmailDraft ? 'ready' : 'failed',
		activeMessageOperationId: undefined,
		activeArtifactOperationId: undefined,
		errorText,
		updatedAt: now
	});
}

export const appendAssistantMessageDelta = internalMutation({
	args: {
		operationId: v.string(),
		delta: v.string()
	},
	handler: async (ctx, { operationId, delta }) => {
		const operation = await getOperationById(ctx, operationId);

		if (!operation?.assistantMessageId || operation.status !== 'running') {
			return;
		}

		const message = await ctx.db.get(operation.assistantMessageId);

		if (!message || message.status === 'failed' || message.status === 'complete') {
			return;
		}

		const now = Date.now();

		await ctx.db.patch(message._id, {
			text: `${message.text}${delta}`,
			status: 'streaming',
			updatedAt: now
		});
	}
});

export const claimRouteAndAskOperation = internalMutation({
	args: {
		operationId: v.string()
	},
	handler: async (ctx, { operationId }) => {
		const now = Date.now();
		const operation = await getOperationById(ctx, operationId);

		if (!operation || operation.kind !== 'routeAndAsk' || operation.status !== 'pending') {
			return null;
		}

		const run = await ctx.db.get(operation.runId);

		if (!run || !isConversationActive(run, now)) {
			await failOperation(ctx, operationId, 'This builder run is no longer active.', now);
			return null;
		}

		const firstMessage = await ctx.db
			.query('customEmailMessages')
			.withIndex('by_run_createdAt', (q) => q.eq('runId', run._id))
			.first();
		const groups = await ctx.db
			.query('builderTemplateGroups')
			.withIndex('by_status_sortOrder', (q) => q.eq('status', 'active'))
			.collect();

		if (groups.length === 0) {
			await failOperation(
				ctx,
				operationId,
				'No custom email template groups are available.',
				now
			);
			return null;
		}

		await ctx.db.patch(operation._id, {
			status: 'running',
			updatedAt: now
		});

		return {
			initialMessage: firstMessage?.text ?? '',
			groups: groups.map(toGroupCandidate)
		};
	}
});

export const completeRouteAndAsk = internalMutation({
	args: {
		operationId: v.string(),
		groupSlug: v.string(),
		questionText: v.string()
	},
	handler: async (ctx, { operationId, groupSlug, questionText }) => {
		const now = Date.now();
		const operation = await getOperationById(ctx, operationId);

		if (!operation || operation.kind !== 'routeAndAsk' || operation.status !== 'running') {
			return;
		}

		const run = await ctx.db.get(operation.runId);
		const assistantMessageId = operation.assistantMessageId;

		if (!run || !assistantMessageId || run.activeMessageOperationId !== operationId) {
			await failOperation(ctx, operationId, 'The builder run changed before the question finished.', now);
			return;
		}

		const assistantText = normalizeAssistantText(questionText);

		if (!assistantText) {
			throw new Error('Assistant question was empty.');
		}

		await ctx.db.patch(assistantMessageId, {
			text: assistantText,
			status: 'complete',
			updatedAt: now
		});
		await completeOperation(ctx, operation, now);

		const artifactOperationId = await insertOperation(ctx, {
			runId: run._id,
			kind: 'prepareHiddenDraft',
			createdAt: now + 1
		});

		await ctx.db.patch(run._id, {
			phase: 'waitingForInitialAnswer',
			workingArtifactStatus: 'preparing',
			selectedTemplateGroupSlug: groupSlug,
			initialQuestionText: assistantText,
			activeMessageOperationId: undefined,
			activeArtifactOperationId: artifactOperationId,
			errorText: undefined,
			updatedAt: now
		});
		await ctx.scheduler.runAfter(0, internal.customEmailOperations.prepareHiddenDraftOperation, {
			operationId: artifactOperationId
		});
	}
});

export const failCustomEmailOperation = internalMutation({
	args: {
		operationId: v.string(),
		errorText: v.string()
	},
	handler: async (ctx, { operationId, errorText }) => {
		await failOperation(ctx, operationId, errorText, Date.now());
	}
});

export const failRefinementOperation = internalMutation({
	args: {
		operationId: v.string(),
		errorText: v.string()
	},
	handler: async (ctx, { operationId, errorText }) => {
		await failOperation(ctx, operationId, errorText, Date.now(), {
			phase: 'ready',
			clearActiveArtifactOperation: false,
			writeRunError: false
		});
	}
});

export const routeAndAsk = internalAction({
	args: {
		operationId: v.string()
	},
	handler: async (ctx, { operationId }) => {
		try {
			const context = await ctx.runMutation(
				internal.customEmailOperations.claimRouteAndAskOperation,
				{ operationId }
			);

			if (!context) {
				return;
			}

			const routeResult = await routeEmailBuilderRequest({
				initialMessage: context.initialMessage,
				groups: context.groups
			});
			const group =
				context.groups.find((candidate) => candidate.slug === routeResult.groupSlug) ??
				context.groups[0];
			let pendingText = '';
			let lastFlushAt = Date.now();

			const questionText = await streamEmailInitialQuestion({
				initialMessage: context.initialMessage,
				group,
				proposedQuestion: routeResult.question,
				handlers: {
					onDelta: async (delta) => {
						pendingText += delta;
						const now = Date.now();

						if (
							pendingText.length >= ASSISTANT_STREAM_FLUSH_MIN_CHARS ||
							now - lastFlushAt >= ASSISTANT_STREAM_FLUSH_INTERVAL_MS
						) {
							const deltaToFlush = pendingText;
							pendingText = '';
							lastFlushAt = now;
							await ctx.runMutation(internal.customEmailOperations.appendAssistantMessageDelta, {
								operationId,
								delta: deltaToFlush
							});
						}
					}
				}
			});

			if (pendingText) {
				await ctx.runMutation(internal.customEmailOperations.appendAssistantMessageDelta, {
					operationId,
					delta: pendingText
				});
			}

			await ctx.runMutation(internal.customEmailOperations.completeRouteAndAsk, {
				operationId,
				groupSlug: group.slug,
				questionText
			});
		} catch (error) {
			await ctx.runMutation(internal.customEmailOperations.failCustomEmailOperation, {
				operationId,
				errorText: getErrorMessage(error)
			});
		}
	}
});

export const claimPrepareHiddenDraftOperation = internalMutation({
	args: {
		operationId: v.string()
	},
	handler: async (ctx, { operationId }) => {
		const now = Date.now();
		const operation = await getOperationById(ctx, operationId);

		if (!operation || operation.kind !== 'prepareHiddenDraft' || operation.status !== 'pending') {
			return null;
		}

		const run = await ctx.db.get(operation.runId);

		if (!run || !isConversationActive(run, now)) {
			await failHiddenDraftState(ctx, operation, 'This builder run is no longer active.', now);
			return null;
		}

		if (run.activeArtifactOperationId !== operationId) {
			await completeOperation(ctx, operation, now);
			return null;
		}

		const selectedTemplateGroupSlug = run.selectedTemplateGroupSlug;

		if (!selectedTemplateGroupSlug) {
			await failHiddenDraftState(ctx, operation, 'The selected template group is unavailable.', now);
			return null;
		}

		const group = await ctx.db
			.query('builderTemplateGroups')
			.withIndex('by_slug', (q) => q.eq('slug', selectedTemplateGroupSlug))
			.unique();

		if (!group) {
			await failHiddenDraftState(ctx, operation, 'The selected template group is unavailable.', now);
			return null;
		}

		const templates = await ctx.db
			.query('builderTemplates')
			.withIndex('by_group_status_sortOrder', (q) =>
				q.eq('groupSlug', selectedTemplateGroupSlug).eq('status', 'active')
			)
			.collect();

		if (templates.length === 0) {
			await failHiddenDraftState(
				ctx,
				operation,
				'No custom email templates are available for this group.',
				now
			);
			return null;
		}

		const firstMessage = await ctx.db
			.query('customEmailMessages')
			.withIndex('by_run_createdAt', (q) => q.eq('runId', run._id))
			.first();

		await ctx.db.patch(operation._id, {
			status: 'running',
			updatedAt: now
		});

		return {
			initialMessage: firstMessage?.text ?? '',
			group: toGroupCandidate(group),
			templates: templates.map(toTemplateCandidate)
		};
	}
});

export const completeHiddenDraft = internalMutation({
	args: {
		operationId: v.string(),
		templateSlug: v.string(),
		emailDraft: emailDraftValidator
	},
	handler: async (ctx, { operationId, templateSlug, emailDraft }) => {
		const now = Date.now();
		const operation = await getOperationById(ctx, operationId);

		if (!operation || operation.kind !== 'prepareHiddenDraft' || operation.status !== 'running') {
			return;
		}

		const run = await ctx.db.get(operation.runId);

		if (!run || run.phase === 'failed' || run.activeArtifactOperationId !== operationId) {
			await completeOperation(ctx, operation, now);
			return;
		}

		await completeOperation(ctx, operation, now);
		await ctx.db.patch(operation.runId, {
			workingEmailDraft: normalizeEmailDraft(emailDraft),
			workingArtifactStatus: 'ready',
			selectedTemplateSlug: templateSlug,
			activeArtifactOperationId: undefined,
			errorText: undefined,
			updatedAt: now
		});
	}
});

export const failHiddenDraft = internalMutation({
	args: {
		operationId: v.string(),
		errorText: v.string()
	},
	handler: async (ctx, { operationId, errorText }) => {
		const now = Date.now();
		const operation = await getOperationById(ctx, operationId);

		if (!operation) {
			return;
		}

		await failHiddenDraftState(ctx, operation, errorText, now);
	}
});

export const prepareHiddenDraftOperation = internalAction({
	args: {
		operationId: v.string()
	},
	handler: async (ctx, { operationId }) => {
		try {
			const context = await ctx.runMutation(
				internal.customEmailOperations.claimPrepareHiddenDraftOperation,
				{ operationId }
			);

			if (!context) {
				return;
			}

			const adapted = await adaptEmailBuilderTemplate({
				initialMessage: context.initialMessage,
				group: context.group,
				templates: context.templates
			});

			await ctx.runMutation(internal.customEmailOperations.completeHiddenDraft, {
				operationId,
				templateSlug: adapted.templateSlug,
				emailDraft: adapted.emailDraft
			});
		} catch (error) {
			await ctx.runMutation(internal.customEmailOperations.failHiddenDraft, {
				operationId,
				errorText: getErrorMessage(error)
			});
		}
	}
});

export const claimApplyInitialAnswerOperation = internalMutation({
	args: {
		operationId: v.string()
	},
	handler: async (ctx, { operationId }) => {
		const now = Date.now();
		const operation = await getOperationById(ctx, operationId);

		if (!operation || operation.kind !== 'applyInitialAnswer' || operation.status !== 'pending') {
			return {
				state: 'terminal' as const
			};
		}

		const run = await ctx.db.get(operation.runId);

		if (!run || !isConversationActive(run, now)) {
			await failOperation(ctx, operationId, 'This builder run is no longer active.', now);
			return {
				state: 'terminal' as const
			};
		}

		if (run.phase === 'failed' || run.workingArtifactStatus === 'failed') {
			await failOperation(
				ctx,
				operationId,
				run.errorText ?? 'The draft could not be prepared.',
				now
			);
			return {
				state: 'terminal' as const
			};
		}

		if (run.activeMessageOperationId !== operationId) {
			await completeOperation(ctx, operation, now);
			return {
				state: 'terminal' as const
			};
		}

		if (!run.workingEmailDraft) {
			const nextAttempt = operation.attempt + 1;

			if (nextAttempt >= operation.maxAttempts || now >= operation.deadlineAt) {
				await failOperation(
					ctx,
					operationId,
					'The draft took too long to prepare. Please start a new custom builder run.',
					now
				);

				return {
					state: 'terminal' as const
				};
			}

			await ctx.db.patch(operation._id, {
				attempt: nextAttempt,
				updatedAt: now
			});

			return {
				state: 'retry' as const,
				retryAfterMs: INITIAL_ANSWER_RETRY_MS
			};
		}

		const messages = await ctx.db
			.query('customEmailMessages')
			.withIndex('by_run_createdAt', (q) => q.eq('runId', run._id))
			.collect();
		const initialMessage = messages.find((message) => message.role === 'user')?.text ?? '';

		await ctx.db.patch(operation._id, {
			status: 'running',
			updatedAt: now
		});

		return {
			state: 'ready' as const,
			initialMessage,
			initialQuestion: run.initialQuestionText ?? '',
			initialAnswer: run.initialAnswerText ?? '',
			workingEmailDraft: run.workingEmailDraft
		};
	}
});

export const completeInitialAnswer = internalMutation({
	args: {
		operationId: v.string(),
		emailDraft: emailDraftValidator
	},
	handler: async (ctx, { operationId, emailDraft }) => {
		const now = Date.now();
		const operation = await getOperationById(ctx, operationId);

		if (!operation || operation.kind !== 'applyInitialAnswer' || operation.status !== 'running') {
			return;
		}

		const run = await ctx.db.get(operation.runId);

		if (!run || run.phase === 'failed' || run.activeMessageOperationId !== operationId) {
			await completeOperation(ctx, operation, now);
			return;
		}

		const assistantText = 'I adjusted the draft based on that and put it in the panel.';
		const nextDraft = normalizeEmailDraft(emailDraft);

		if (operation.assistantMessageId) {
			await ctx.db.patch(operation.assistantMessageId, {
				text: assistantText,
				status: 'complete',
				updatedAt: now
			});
		}

		await completeOperation(ctx, operation, now);
		await ctx.db.patch(operation.runId, {
			phase: 'ready',
			artifactVersion: 1,
			artifactVisibility: 'visible',
			visibleArtifactStatus: 'ready',
			workingArtifactStatus: 'ready',
			workingEmailDraft: nextDraft,
			visibleEmailDraft: nextDraft,
			activeMessageOperationId: undefined,
			errorText: undefined,
			updatedAt: now
		});
	}
});

export const applyInitialAnswerOperation = internalAction({
	args: {
		operationId: v.string()
	},
	handler: async (ctx, { operationId }) => {
		try {
			const claim = await ctx.runMutation(
				internal.customEmailOperations.claimApplyInitialAnswerOperation,
				{ operationId }
			);

			if (claim.state === 'retry') {
				await ctx.scheduler.runAfter(
					claim.retryAfterMs,
					internal.customEmailOperations.applyInitialAnswerOperation,
					{
						operationId
					}
				);
				return;
			}

			if (claim.state !== 'ready') {
				return;
			}

			const emailDraft = await applyEmailInitialAnswer({
				initialMessage: claim.initialMessage,
				initialQuestion: claim.initialQuestion,
				initialAnswer: claim.initialAnswer,
				draft: claim.workingEmailDraft
			});

			await ctx.runMutation(internal.customEmailOperations.completeInitialAnswer, {
				operationId,
				emailDraft
			});
		} catch (error) {
			await ctx.runMutation(internal.customEmailOperations.failCustomEmailOperation, {
				operationId,
				errorText: getErrorMessage(error)
			});
		}
	}
});

export const claimRefinementOperation = internalMutation({
	args: {
		operationId: v.string()
	},
	handler: async (ctx, { operationId }) => {
		const now = Date.now();
		const operation = await getOperationById(ctx, operationId);

		if (!operation || operation.kind !== 'refine' || operation.status !== 'pending') {
			return null;
		}

		const run = await ctx.db.get(operation.runId);

		if (!run || !isConversationActive(run, now)) {
			await failOperation(ctx, operationId, 'This builder run is no longer active.', now, {
				phase: 'ready',
				clearActiveArtifactOperation: false,
				writeRunError: false
			});
			return null;
		}

		if (run.activeMessageOperationId !== operationId) {
			await completeOperation(ctx, operation, now);
			return null;
		}

		if (!run.visibleEmailDraft) {
			await failOperation(ctx, operationId, 'The visible email draft is unavailable.', now);
			return null;
		}

		const messages = await ctx.db
			.query('customEmailMessages')
			.withIndex('by_run_createdAt', (q) => q.eq('runId', run._id))
			.collect();
		const events = await ctx.db
			.query('customEmailEvents')
			.withIndex('by_run_createdAt', (q) => q.eq('runId', run._id))
			.collect();

		await ctx.db.patch(operation._id, {
			status: 'running',
			updatedAt: now
		});

		return {
			draft: run.visibleEmailDraft,
			transcript: messages
				.filter((message) => message.status === 'complete' && message.text.trim())
				.slice(-12)
				.map((message) => ({
					role: message.role,
					text: message.text
				})),
			recentEvents: events.slice(-5).map((event) => ({
				summary: event.summary,
				changedFields: event.changedFields,
				createdAt: event.createdAt
			}))
		};
	}
});

export const completeRefinement = internalMutation({
	args: {
		operationId: v.string(),
		text: v.string(),
		patch: v.union(v.null(), emailDraftPatchValidator),
		patchIntent: v.union(v.literal('none'), v.literal('noop'), v.literal('meaningful'))
	},
	handler: async (ctx, { operationId, text, patch, patchIntent }) => {
		const now = Date.now();
		const operation = await getOperationById(ctx, operationId);

		if (!operation || operation.kind !== 'refine' || operation.status !== 'running') {
			return;
		}

		const run = await ctx.db.get(operation.runId);

		if (!run || !run.visibleEmailDraft || run.activeMessageOperationId !== operationId) {
			await completeOperation(ctx, operation, now);
			return;
		}

		let nextDraft: EmailDraft | null = null;
		let nextArtifactVersion = run.artifactVersion;

		if (patchIntent === 'meaningful' && patch && patch.operations.length > 0) {
			const patchedDraft = applyEmailDraftPatch(run.visibleEmailDraft, patch);

			if (hasEmailDraftChanged(run.visibleEmailDraft, patchedDraft)) {
				nextDraft = patchedDraft;
				nextArtifactVersion += 1;
			}
		}

		const assistantText =
			normalizeAssistantText(text) ||
			(nextDraft ? 'Updated the draft.' : patchIntent === 'noop' ? 'No changes needed.' : '');

		if (!assistantText) {
			throw new Error('Assistant response was empty.');
		}

		if (operation.assistantMessageId) {
			await ctx.db.patch(operation.assistantMessageId, {
				text: assistantText,
				status: 'complete',
				updatedAt: now
			});
		}

		await completeOperation(ctx, operation, now);
		await ctx.db.patch(operation.runId, {
			phase: 'ready',
			artifactVersion: nextArtifactVersion,
			...(nextDraft
				? {
						visibleEmailDraft: nextDraft,
						workingEmailDraft: nextDraft,
						visibleArtifactStatus: 'ready' as const,
						workingArtifactStatus: 'ready' as const
					}
				: {}),
			activeMessageOperationId: undefined,
			errorText: undefined,
			updatedAt: now
		});
	}
});

export const refineOperation = internalAction({
	args: {
		operationId: v.string()
	},
	handler: async (ctx, { operationId }) => {
		try {
			const context = await ctx.runMutation(
				internal.customEmailOperations.claimRefinementOperation,
				{ operationId }
			);

			if (!context) {
				return;
			}

			let pendingText = '';
			let lastFlushAt = Date.now();
			const result = await streamCustomEmailBuilderTurn({
				transcript: context.transcript,
				draft: context.draft,
				recentEvents: context.recentEvents,
				handlers: {
					onTextDelta: async (delta) => {
						pendingText += delta;
						const now = Date.now();

						if (
							pendingText.length >= ASSISTANT_STREAM_FLUSH_MIN_CHARS ||
							now - lastFlushAt >= ASSISTANT_STREAM_FLUSH_INTERVAL_MS
						) {
							const deltaToFlush = pendingText;
							pendingText = '';
							lastFlushAt = now;
							await ctx.runMutation(internal.customEmailOperations.appendAssistantMessageDelta, {
								operationId,
								delta: deltaToFlush
							});
						}
					}
				}
			});

			if (pendingText) {
				await ctx.runMutation(internal.customEmailOperations.appendAssistantMessageDelta, {
					operationId,
					delta: pendingText
				});
			}

			await ctx.runMutation(internal.customEmailOperations.completeRefinement, {
				operationId,
				text: result.text,
				patch: result.patch,
				patchIntent: result.patchIntent
			});
		} catch (error) {
			await ctx.runMutation(internal.customEmailOperations.failRefinementOperation, {
				operationId,
				errorText: getErrorMessage(error)
			});
		}
	}
});
