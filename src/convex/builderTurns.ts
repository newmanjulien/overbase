import { internal } from './_generated/api';
import { internalAction } from './_generated/server';
import { v } from 'convex/values';
import { generateBuilderTurnResult } from './model';

export const generateEmailBuilderTurn = internalAction({
	args: {
		conversationId: v.id('conversations'),
		assistantMessageId: v.id('messages'),
		generationId: v.string()
	},
	handler: async (ctx, { conversationId, assistantMessageId, generationId }) => {
		const startedAt = Date.now();

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

			const turn = await generateBuilderTurnResult({
				transcript,
				draft: builderContext.emailDraft,
				artifactVersion: builderContext.artifactVersion
			});

			await ctx.runMutation(internal.builderSessions.completeBuilderTurn, {
				assistantMessageId,
				generationId,
				turn
			});

			console.log('builderTurns.generateEmailBuilderTurn completed', {
				conversationId,
				assistantMessageId,
				generationId,
				totalDurationMs: Date.now() - startedAt,
				operationCount: turn.patch.operations.length,
				nextArtifactVersion: builderContext.artifactVersion + 1
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : 'AI builder turn generation failed.';

			await ctx.runMutation(internal.chat.failAssistantMessage, {
				assistantMessageId,
				generationId,
				text: 'I could not update the email draft from that response. Please try again.',
				errorText: message
			});

			console.error('builderTurns.generateEmailBuilderTurn failed', {
				conversationId,
				assistantMessageId,
				generationId,
				totalDurationMs: Date.now() - startedAt,
				error: message
			});
		}
	}
});
