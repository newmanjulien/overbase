import { internalMutation, type MutationCtx } from './_generated/server';
import {
	builderArtworkPresets,
	builderCards,
	builderCategories,
	builderGuides,
	builderTemplateGroups,
	builderTemplates
} from './builderContent';

type ResetTable =
	| 'customEmailEvents'
	| 'customEmailMessages'
	| 'customEmailOperations'
	| 'customEmailRuns'
	| 'builderTemplates'
	| 'builderTemplateGroups'
	| 'messages'
	| 'conversations'
	| 'builderGuides'
	| 'builderCards'
	| 'builderArtworkPresets'
	| 'builderCategories';

async function deleteAllFromTable(ctx: MutationCtx, table: ResetTable) {
	const documents = await ctx.db.query(table).collect();

	for (const document of documents) {
		await ctx.db.delete(document._id);
	}

	return documents.length;
}

export const resetBuilderContent = internalMutation({
	args: {},
	handler: async (ctx) => {
		const deleted = {
			customEmailEvents: await deleteAllFromTable(ctx, 'customEmailEvents'),
			customEmailMessages: await deleteAllFromTable(ctx, 'customEmailMessages'),
			customEmailOperations: await deleteAllFromTable(ctx, 'customEmailOperations'),
			customEmailRuns: await deleteAllFromTable(ctx, 'customEmailRuns'),
			builderTemplates: await deleteAllFromTable(ctx, 'builderTemplates'),
			builderTemplateGroups: await deleteAllFromTable(ctx, 'builderTemplateGroups'),
			messages: await deleteAllFromTable(ctx, 'messages'),
			conversations: await deleteAllFromTable(ctx, 'conversations'),
			builderGuides: await deleteAllFromTable(ctx, 'builderGuides'),
			builderCards: await deleteAllFromTable(ctx, 'builderCards'),
			builderArtworkPresets: await deleteAllFromTable(ctx, 'builderArtworkPresets'),
			builderCategories: await deleteAllFromTable(ctx, 'builderCategories')
		};

		for (const category of builderCategories) {
			await ctx.db.insert('builderCategories', category);
		}

		for (const artworkPreset of builderArtworkPresets) {
			await ctx.db.insert('builderArtworkPresets', artworkPreset);
		}

		for (const card of builderCards) {
			await ctx.db.insert('builderCards', {
				...card,
				categoryIds: [...card.categoryIds]
			});
		}

		for (const guide of builderGuides) {
			await ctx.db.insert('builderGuides', {
				...guide,
				questions: guide.questions.map((question) =>
					question.type === 'choice'
						? {
								...question,
								options: [...question.options]
							}
						: question
				)
			});
		}

		for (const templateGroup of builderTemplateGroups) {
			await ctx.db.insert('builderTemplateGroups', templateGroup);
		}

		for (const template of builderTemplates) {
			await ctx.db.insert('builderTemplates', {
				...template,
				matchSignals: [...template.matchSignals],
				emailDraft: {
					...template.emailDraft,
					to: [...template.emailDraft.to],
					cc: [...template.emailDraft.cc],
					attachments: [...template.emailDraft.attachments],
					body: template.emailDraft.body.map((block) =>
						block.type === 'bullets' ? { ...block, items: [...block.items] } : block
					)
				}
			});
		}

		return {
			deleted,
			inserted: {
				builderCategories: builderCategories.length,
				builderArtworkPresets: builderArtworkPresets.length,
				builderCards: builderCards.length,
				builderGuides: builderGuides.length,
				builderTemplateGroups: builderTemplateGroups.length,
				builderTemplates: builderTemplates.length
			}
		};
	}
});
