import { internal } from './_generated/api';
import { internalAction } from './_generated/server';
import { v } from 'convex/values';
import { streamBuilderTurn } from './model';

const ASSISTANT_STREAM_FLUSH_INTERVAL_MS = 150;
const ASSISTANT_STREAM_FLUSH_MIN_CHARS = 120;

export const generateEmailBuilderTurn = internalAction({
	args: {
		conversationId: v.id('conversations'),
		assistantMessageId: v.id('messages'),
		generationId: v.string()
	},
	handler: async (ctx, { conversationId, assistantMessageId, generationId }) => {
		const startedAt = Date.now();
		let firstTokenAt: number | null = null;
		let draftText = '';
		let flushedText = '';
		let lastFlushAt = 0;
		let flushCount = 0;

		async function flushDraft(force = false) {
			if (draftText === flushedText) {
				return;
			}

			const now = Date.now();
			const hasEnoughText = draftText.length - flushedText.length >= ASSISTANT_STREAM_FLUSH_MIN_CHARS;
			const hasWaited = now - lastFlushAt >= ASSISTANT_STREAM_FLUSH_INTERVAL_MS;

			if (!force && !hasEnoughText && !hasWaited) {
				return;
			}

			flushedText = draftText;
			lastFlushAt = now;
			flushCount += 1;

			await ctx.runMutation(internal.chat.updateAssistantMessageDraft, {
				assistantMessageId,
				generationId,
				text: flushedText
			});
		}

		try {
			const [builderContext, transcript] = await Promise.all([
				ctx.runQuery(internal.builderSessions.getBuilderTurnContext, { conversationId }),
				ctx.runQuery(internal.chat.getTranscript, { conversationId })
			]);

			if (!builderContext) {
				await ctx.runMutation(internal.chat.failAssistantMessage, {
					assistantMessageId,
					generationId,
					text: 'No active builder session was available.'
				});
				return;
			}

			if (transcript.length === 0) {
				await ctx.runMutation(internal.chat.failAssistantMessage, {
					assistantMessageId,
					generationId,
					text: 'No conversation transcript was available.'
				});
				return;
			}

			const result = await streamBuilderTurn({
				transcript,
				draft: builderContext.emailDraft,
				artifactVersion: builderContext.artifactVersion,
				handlers: {
					onTextDelta: async (delta) => {
						if (firstTokenAt === null) {
							firstTokenAt = Date.now();
						}

						draftText += delta;
						await flushDraft();
					}
				}
			});
			const assistantText =
				result.text.trim() || (result.previewUpdate ? 'I updated the email preview.' : '');

			draftText = assistantText;
			await flushDraft(true);

			await ctx.runMutation(internal.builderSessions.completeStreamingBuilderTurn, {
				assistantMessageId,
				generationId,
				text: assistantText,
				previewUpdate: result.previewUpdate
			});

			console.log('builderTurns.generateEmailBuilderTurn completed', {
				conversationId,
				assistantMessageId,
				generationId,
				timeToFirstTokenMs: firstTokenAt === null ? null : firstTokenAt - startedAt,
				totalDurationMs: Date.now() - startedAt,
				flushCount,
				operationCount: result.previewUpdate?.patch.operations.length ?? 0,
				nextArtifactVersion: result.previewUpdate ? builderContext.artifactVersion + 1 : null
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : 'AI builder turn generation failed.';
			const hasPartialText = draftText.trim().length > 0;

			await ctx.runMutation(
				internal.chat.failAssistantMessage,
				hasPartialText
					? {
							assistantMessageId,
							generationId,
							text: draftText,
							errorText: message
						}
					: {
							assistantMessageId,
							generationId,
							text: 'I could not update the email draft from that response. Please try again.',
							errorText: message
						}
			);

			console.error('builderTurns.generateEmailBuilderTurn failed', {
				conversationId,
				assistantMessageId,
				generationId,
				timeToFirstTokenMs: firstTokenAt === null ? null : firstTokenAt - startedAt,
				totalDurationMs: Date.now() - startedAt,
				flushCount,
				partialCharacterCount: draftText.length,
				error: message
			});
		}
	}
});

export const generateEmailPolishTurn = generateEmailBuilderTurn;
