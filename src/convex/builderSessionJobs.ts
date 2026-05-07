import { v } from 'convex/values';
import { internal } from './_generated/api';
import type { Doc } from './_generated/dataModel';
import { internalAction, internalMutation, type MutationCtx } from './_generated/server';
import {
	emailDraft as emailDraftValidator,
	emailDraftPatch as emailDraftPatchValidator
} from './emailDesignValidators';
import {
	applyEmailDraftPatch,
	CUSTOM_EMAIL_BUILDER_APP_ID,
	hasEmailDraftChanged,
	normalizeEmailDraft,
	type EmailDraft
} from './emailDesign';
import {
	adaptEmailExample,
	applyEmailInitialAnswer,
	getCustomEmailExamples,
	listCustomEmailDraftExamples,
	listCustomEmailExamples,
	routeEmailBuilderRequest,
	streamCustomEmailBuilderTurn,
	streamEmailInitialQuestion,
	type EmailExampleCandidate,
	type EmailExamplesCandidate
} from '../external/custom';
import { getEmailExternalApp } from '../lib/features/builder/external/operations';
import { isBuilderSessionActive } from './builderSessionAccess';
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
} from './builderSessionCore';

function toExamplesCandidate(examples: {
	slug: string;
	description: string;
	questionGuidance: string;
}): EmailExamplesCandidate {
	return {
		slug: examples.slug,
		description: examples.description,
		questionGuidance: examples.questionGuidance
	};
}

function toDraftExampleCandidate(example: {
	slug: string;
	description: string;
	matchSignals: string[];
	emailDraft: EmailDraft;
}): EmailExampleCandidate {
	return {
		slug: example.slug,
		description: example.description,
		matchSignals: example.matchSignals,
		emailDraft: example.emailDraft
	};
}

async function failHiddenDraftState(
	ctx: MutationCtx,
	operation: Doc<'builderSessionJobs'>,
	errorText: string,
	now: number
) {
	const session = await ctx.db.get(operation.sessionId);

	if (!session) {
		await ctx.db.patch(operation._id, {
			status: 'failed',
			errorText,
			updatedAt: now
		});
		return;
	}

	if (session.activeMessageOperationId) {
		const activeMessageOperation = await getOperationById(ctx, session.activeMessageOperationId);

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
	await ctx.db.patch(operation.sessionId, {
		phase: 'failed',
		workingArtifactStatus: 'failed',
		visibleArtifactStatus: session.visibleEmailDraft ? 'ready' : 'failed',
		activeMessageOperationId: undefined,
		activeArtifactOperationId: undefined,
		errorText,
		updatedAt: now
	});
}

async function failInitialDraftState(
	ctx: MutationCtx,
	operationId: string,
	errorText: string,
	now: number
) {
	await failOperation(ctx, operationId, errorText, now, {
		artifactVisibility: 'hidden',
		workingArtifactStatus: 'failed',
		visibleArtifactStatus: 'failed'
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

		const session = await ctx.db.get(operation.sessionId);

		if (!session || !isBuilderSessionActive(session, now)) {
			await failInitialDraftState(ctx, operationId, 'This builder session is no longer active.', now);
			return null;
		}

		if (session.appSlug !== CUSTOM_EMAIL_BUILDER_APP_ID) {
			await completeOperation(ctx, operation, now);
			return null;
		}

		const firstMessage = await ctx.db
			.query('builderSessionMessages')
			.withIndex('by_session_createdAt', (q) => q.eq('sessionId', session._id))
			.first();
		const examples = listCustomEmailExamples();

		if (examples.length === 0) {
			await failOperation(ctx, operationId, 'No custom email examples are available.', now);
			return null;
		}

		await ctx.db.patch(operation._id, {
			status: 'running',
			updatedAt: now
		});

		return {
			initialMessage: firstMessage?.text ?? '',
			examples: examples.map(toExamplesCandidate)
		};
	}
});

export const completeRouteAndAsk = internalMutation({
	args: {
		operationId: v.string(),
		examplesSlug: v.string(),
		questionText: v.string()
	},
	handler: async (ctx, { operationId, examplesSlug, questionText }) => {
		const now = Date.now();
		const operation = await getOperationById(ctx, operationId);

		if (!operation || operation.kind !== 'routeAndAsk' || operation.status !== 'running') {
			return;
		}

		const session = await ctx.db.get(operation.sessionId);
		const assistantMessageId = operation.assistantMessageId;

		if (!session || !assistantMessageId || session.activeMessageOperationId !== operationId) {
			await failOperation(ctx, operationId, 'The builder session changed before the question finished.', now);
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
			sessionId: session._id,
			kind: 'prepareHiddenDraft',
			createdAt: now + 1
		});

		await ctx.db.patch(session._id, {
			phase: 'waitingForInitialAnswer',
			workingArtifactStatus: 'preparing',
			selectedEmailExamplesSlug: examplesSlug,
			initialQuestionText: assistantText,
			activeMessageOperationId: undefined,
			activeArtifactOperationId: artifactOperationId,
			errorText: undefined,
			updatedAt: now
		});
		await ctx.scheduler.runAfter(0, internal.builderSessionJobs.prepareHiddenDraftOperation, {
			operationId: artifactOperationId
		});
	}
});

export const failNotificationJob = internalMutation({
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
			writeSessionError: false
		});
	}
});

export const claimPrepareInitialDraftOperation = internalMutation({
	args: {
		operationId: v.string()
	},
	handler: async (ctx, { operationId }) => {
		const now = Date.now();
		const operation = await getOperationById(ctx, operationId);

		if (!operation || operation.kind !== 'prepareInitialDraft' || operation.status !== 'pending') {
			return null;
		}

		const session = await ctx.db.get(operation.sessionId);

		if (!session || !isBuilderSessionActive(session, now)) {
			await failOperation(ctx, operationId, 'This builder session is no longer active.', now);
			return null;
		}

		if (
			session.appSlug === CUSTOM_EMAIL_BUILDER_APP_ID ||
			session.activeMessageOperationId !== operationId
		) {
			await completeOperation(ctx, operation, now);
			return null;
		}

		const app = getEmailExternalApp(session.appSlug);

		if (!app) {
			await failInitialDraftState(ctx, operationId, 'This app is unavailable.', now);
			return null;
		}

		const firstMessage = await ctx.db
			.query('builderSessionMessages')
			.withIndex('by_session_createdAt', (q) => q.eq('sessionId', session._id))
			.first();

		await ctx.db.patch(operation._id, {
			status: 'running',
			updatedAt: now
		});

		return {
			appSlug: session.appSlug,
			initialMessage: firstMessage?.text ?? ''
		};
	}
});

export const completeInitialDraft = internalMutation({
	args: {
		operationId: v.string(),
		emailDraft: emailDraftValidator
	},
	handler: async (ctx, { operationId, emailDraft }) => {
		const now = Date.now();
		const operation = await getOperationById(ctx, operationId);

		if (!operation || operation.kind !== 'prepareInitialDraft' || operation.status !== 'running') {
			return;
		}

		const session = await ctx.db.get(operation.sessionId);

		if (!session || session.activeMessageOperationId !== operationId) {
			await completeOperation(ctx, operation, now);
			return;
		}

		const assistantText = 'I built the first draft and put it in the panel.';
		const nextDraft = normalizeEmailDraft(emailDraft);

		if (operation.assistantMessageId) {
			await ctx.db.patch(operation.assistantMessageId, {
				text: assistantText,
				status: 'complete',
				updatedAt: now
			});
		}

		await completeOperation(ctx, operation, now);
		await ctx.db.patch(operation.sessionId, {
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

export const failInitialDraftOperation = internalMutation({
	args: {
		operationId: v.string(),
		errorText: v.string()
	},
	handler: async (ctx, { operationId, errorText }) => {
		await failInitialDraftState(ctx, operationId, errorText, Date.now());
	}
});

export const prepareInitialDraftOperation = internalAction({
	args: {
		operationId: v.string()
	},
	handler: async (ctx, { operationId }) => {
		try {
			const context = await ctx.runMutation(
				internal.builderSessionJobs.claimPrepareInitialDraftOperation,
				{ operationId }
			);

			if (!context) {
				return;
			}

			const app = getEmailExternalApp(context.appSlug);

			if (!app) {
				throw new Error('This app is unavailable.');
			}

			const emailDraft = await app.createInitialDraft({
				initialMessage: context.initialMessage
			});

			await ctx.runMutation(internal.builderSessionJobs.completeInitialDraft, {
				operationId,
				emailDraft
			});
		} catch (error) {
			await ctx.runMutation(internal.builderSessionJobs.failInitialDraftOperation, {
				operationId,
				errorText: getErrorMessage(error)
			});
		}
	}
});

export const routeAndAsk = internalAction({
	args: {
		operationId: v.string()
	},
	handler: async (ctx, { operationId }) => {
		try {
			const context = await ctx.runMutation(
				internal.builderSessionJobs.claimRouteAndAskOperation,
				{ operationId }
			);

			if (!context) {
				return;
			}

			const routeResult = await routeEmailBuilderRequest({
				initialMessage: context.initialMessage,
				examples: context.examples
			});
			const examples =
				context.examples.find((candidate) => candidate.slug === routeResult.examplesSlug) ??
				context.examples[0];
			let pendingText = '';
			let lastFlushAt = Date.now();

			const questionText = await streamEmailInitialQuestion({
				initialMessage: context.initialMessage,
				examples,
				proposedQuestion: routeResult.question,
				handlers: {
					onDelta: async (delta: string) => {
						pendingText += delta;
						const now = Date.now();

						if (
							pendingText.length >= ASSISTANT_STREAM_FLUSH_MIN_CHARS ||
							now - lastFlushAt >= ASSISTANT_STREAM_FLUSH_INTERVAL_MS
						) {
							const deltaToFlush = pendingText;
							pendingText = '';
							lastFlushAt = now;
							await ctx.runMutation(internal.builderSessionJobs.appendAssistantMessageDelta, {
								operationId,
								delta: deltaToFlush
							});
						}
					}
				}
			});

			if (pendingText) {
				await ctx.runMutation(internal.builderSessionJobs.appendAssistantMessageDelta, {
					operationId,
					delta: pendingText
				});
			}

			await ctx.runMutation(internal.builderSessionJobs.completeRouteAndAsk, {
				operationId,
				examplesSlug: examples.slug,
				questionText
			});
		} catch (error) {
			await ctx.runMutation(internal.builderSessionJobs.failNotificationJob, {
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

		const session = await ctx.db.get(operation.sessionId);

		if (!session || !isBuilderSessionActive(session, now)) {
			await failHiddenDraftState(ctx, operation, 'This builder session is no longer active.', now);
			return null;
		}

		if (session.activeArtifactOperationId !== operationId) {
			await completeOperation(ctx, operation, now);
			return null;
		}

		const selectedEmailExamplesSlug = session.selectedEmailExamplesSlug;

		if (!selectedEmailExamplesSlug) {
			await failHiddenDraftState(ctx, operation, 'The selected examples are unavailable.', now);
			return null;
		}

		const examples = getCustomEmailExamples(selectedEmailExamplesSlug);

		if (!examples) {
			await failHiddenDraftState(ctx, operation, 'The selected examples are unavailable.', now);
			return null;
		}

		const draftExamples = listCustomEmailDraftExamples(selectedEmailExamplesSlug);

		if (draftExamples.length === 0) {
			await failHiddenDraftState(
				ctx,
				operation,
				'No custom email draft examples are available for these examples.',
				now
			);
			return null;
		}

		const firstMessage = await ctx.db
			.query('builderSessionMessages')
			.withIndex('by_session_createdAt', (q) => q.eq('sessionId', session._id))
			.first();

		await ctx.db.patch(operation._id, {
			status: 'running',
			updatedAt: now
		});

		return {
			initialMessage: firstMessage?.text ?? '',
			examples: toExamplesCandidate(examples),
			draftExamples: draftExamples.map(toDraftExampleCandidate)
		};
	}
});

export const completeHiddenDraft = internalMutation({
	args: {
		operationId: v.string(),
		exampleSlug: v.string(),
		emailDraft: emailDraftValidator
	},
	handler: async (ctx, { operationId, exampleSlug, emailDraft }) => {
		const now = Date.now();
		const operation = await getOperationById(ctx, operationId);

		if (!operation || operation.kind !== 'prepareHiddenDraft' || operation.status !== 'running') {
			return;
		}

		const session = await ctx.db.get(operation.sessionId);

		if (!session || session.phase === 'failed' || session.activeArtifactOperationId !== operationId) {
			await completeOperation(ctx, operation, now);
			return;
		}

		await completeOperation(ctx, operation, now);
		await ctx.db.patch(operation.sessionId, {
			workingEmailDraft: normalizeEmailDraft(emailDraft),
			workingArtifactStatus: 'ready',
			selectedEmailExampleSlug: exampleSlug,
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
				internal.builderSessionJobs.claimPrepareHiddenDraftOperation,
				{ operationId }
			);

			if (!context) {
				return;
			}

			const adapted = await adaptEmailExample({
				initialMessage: context.initialMessage,
				examples: context.examples,
				draftExamples: context.draftExamples
			});

			await ctx.runMutation(internal.builderSessionJobs.completeHiddenDraft, {
				operationId,
				exampleSlug: adapted.exampleSlug,
				emailDraft: adapted.emailDraft
			});
		} catch (error) {
			await ctx.runMutation(internal.builderSessionJobs.failHiddenDraft, {
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

		const session = await ctx.db.get(operation.sessionId);

		if (!session || !isBuilderSessionActive(session, now)) {
			await failOperation(ctx, operationId, 'This builder session is no longer active.', now);
			return {
				state: 'terminal' as const
			};
		}

		if (session.phase === 'failed' || session.workingArtifactStatus === 'failed') {
			await failOperation(
				ctx,
				operationId,
				session.errorText ?? 'The draft could not be prepared.',
				now
			);
			return {
				state: 'terminal' as const
			};
		}

		if (session.activeMessageOperationId !== operationId) {
			await completeOperation(ctx, operation, now);
			return {
				state: 'terminal' as const
			};
		}

		if (!session.workingEmailDraft) {
			const nextAttempt = operation.attempt + 1;

			if (nextAttempt >= operation.maxAttempts || now >= operation.deadlineAt) {
				await failOperation(
					ctx,
					operationId,
					'The draft took too long to prepare. Please start a new custom builder session.',
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
			.query('builderSessionMessages')
			.withIndex('by_session_createdAt', (q) => q.eq('sessionId', session._id))
			.collect();
		const initialMessage = messages.find((message) => message.role === 'user')?.text ?? '';

		await ctx.db.patch(operation._id, {
			status: 'running',
			updatedAt: now
		});

		return {
			state: 'ready' as const,
			initialMessage,
			initialQuestion: session.initialQuestionText ?? '',
			initialAnswer: session.initialAnswerText ?? '',
			workingEmailDraft: session.workingEmailDraft
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

		const session = await ctx.db.get(operation.sessionId);

		if (!session || session.phase === 'failed' || session.activeMessageOperationId !== operationId) {
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
		await ctx.db.patch(operation.sessionId, {
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
				internal.builderSessionJobs.claimApplyInitialAnswerOperation,
				{ operationId }
			);

			if (claim.state === 'retry') {
				await ctx.scheduler.runAfter(
					claim.retryAfterMs,
					internal.builderSessionJobs.applyInitialAnswerOperation,
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

			await ctx.runMutation(internal.builderSessionJobs.completeInitialAnswer, {
				operationId,
				emailDraft
			});
		} catch (error) {
			await ctx.runMutation(internal.builderSessionJobs.failNotificationJob, {
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

		const session = await ctx.db.get(operation.sessionId);

		if (!session || !isBuilderSessionActive(session, now)) {
			await failOperation(ctx, operationId, 'This builder session is no longer active.', now, {
				phase: 'ready',
				clearActiveArtifactOperation: false,
				writeSessionError: false
			});
			return null;
		}

		if (session.activeMessageOperationId !== operationId) {
			await completeOperation(ctx, operation, now);
			return null;
		}

		if (!session.visibleEmailDraft) {
			await failOperation(ctx, operationId, 'The visible email draft is unavailable.', now);
			return null;
		}

		const messages = await ctx.db
			.query('builderSessionMessages')
			.withIndex('by_session_createdAt', (q) => q.eq('sessionId', session._id))
			.collect();
		const events = await ctx.db
			.query('builderSessionEvents')
			.withIndex('by_session_createdAt', (q) => q.eq('sessionId', session._id))
			.collect();

		await ctx.db.patch(operation._id, {
			status: 'running',
			updatedAt: now
		});

		return {
			appSlug: session.appSlug,
			draft: session.visibleEmailDraft,
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

		const session = await ctx.db.get(operation.sessionId);

		if (!session || !session.visibleEmailDraft || session.activeMessageOperationId !== operationId) {
			await completeOperation(ctx, operation, now);
			return;
		}

		let nextDraft: EmailDraft | null = null;
		let nextArtifactVersion = session.artifactVersion;

		if (patchIntent === 'meaningful' && patch && patch.operations.length > 0) {
			const patchedDraft = applyEmailDraftPatch(session.visibleEmailDraft, patch);

			if (hasEmailDraftChanged(session.visibleEmailDraft, patchedDraft)) {
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
		await ctx.db.patch(operation.sessionId, {
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
				internal.builderSessionJobs.claimRefinementOperation,
				{ operationId }
			);

			if (!context) {
				return;
			}

			let pendingText = '';
			let lastFlushAt = Date.now();
			const handlers = {
				onTextDelta: async (delta: string) => {
					pendingText += delta;
					const now = Date.now();

					if (
						pendingText.length >= ASSISTANT_STREAM_FLUSH_MIN_CHARS ||
						now - lastFlushAt >= ASSISTANT_STREAM_FLUSH_INTERVAL_MS
					) {
						const deltaToFlush = pendingText;
						pendingText = '';
						lastFlushAt = now;
						await ctx.runMutation(internal.builderSessionJobs.appendAssistantMessageDelta, {
							operationId,
							delta: deltaToFlush
						});
					}
				}
			};
			const result =
				context.appSlug === CUSTOM_EMAIL_BUILDER_APP_ID
					? await streamCustomEmailBuilderTurn({
							transcript: context.transcript,
							draft: context.draft,
							recentEvents: context.recentEvents,
							handlers
						})
					: await (async () => {
							const app = getEmailExternalApp(context.appSlug);

							if (!app) {
								throw new Error('This app is unavailable.');
							}

							return await app.streamRefinementTurn({
								transcript: context.transcript,
								draft: context.draft,
								recentEvents: context.recentEvents,
								handlers
							});
						})();

			if (pendingText) {
				await ctx.runMutation(internal.builderSessionJobs.appendAssistantMessageDelta, {
					operationId,
					delta: pendingText
				});
			}

			await ctx.runMutation(internal.builderSessionJobs.completeRefinement, {
				operationId,
				text: result.text,
				patch: result.patch,
				patchIntent: result.patchIntent
			});
		} catch (error) {
			await ctx.runMutation(internal.builderSessionJobs.failRefinementOperation, {
				operationId,
				errorText: getErrorMessage(error)
			});
		}
	}
});
