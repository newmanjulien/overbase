import { internalMutation, type MutationCtx } from './_generated/server';
import {
	builderArtworkPresets,
	builderBlueprints,
	builderCategories,
	builderGuides,
	emailTemplateGroups,
	emailTemplates
} from './builderContent';

type ResetTable =
	| 'customEmailEvents'
	| 'customEmailMessages'
	| 'customEmailOperations'
	| 'customEmailRuns'
	| 'emailTemplates'
	| 'emailTemplateGroups'
	| 'messages'
	| 'conversations'
	| 'builderGuides'
	| 'builderBlueprints'
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
			emailTemplates: await deleteAllFromTable(ctx, 'emailTemplates'),
			emailTemplateGroups: await deleteAllFromTable(ctx, 'emailTemplateGroups'),
			messages: await deleteAllFromTable(ctx, 'messages'),
			conversations: await deleteAllFromTable(ctx, 'conversations'),
			builderGuides: await deleteAllFromTable(ctx, 'builderGuides'),
			builderBlueprints: await deleteAllFromTable(ctx, 'builderBlueprints'),
			builderArtworkPresets: await deleteAllFromTable(ctx, 'builderArtworkPresets'),
			builderCategories: await deleteAllFromTable(ctx, 'builderCategories')
		};

		for (const category of builderCategories) {
			await ctx.db.insert('builderCategories', category);
		}

		for (const artworkPreset of builderArtworkPresets) {
			await ctx.db.insert('builderArtworkPresets', artworkPreset);
		}

		for (const blueprint of builderBlueprints) {
			await ctx.db.insert('builderBlueprints', {
				...blueprint,
				categoryIds: [...blueprint.categoryIds]
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

		for (const templateGroup of emailTemplateGroups) {
			await ctx.db.insert('emailTemplateGroups', templateGroup);
		}

		for (const template of emailTemplates) {
			await ctx.db.insert('emailTemplates', {
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
				builderBlueprints: builderBlueprints.length,
				builderGuides: builderGuides.length,
				emailTemplateGroups: emailTemplateGroups.length,
				emailTemplates: emailTemplates.length
			}
		};
	}
});
