import { v } from 'convex/values';
import { query } from './_generated/server';

export const listCategories = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query('builderCategories').withIndex('by_sortOrder').collect();
	}
});

export const listCardArtworkPresets = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query('builderCardArtworkPresets').collect();
	}
});

export const listActiveTemplateCards = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db
			.query('builderCards')
			.withIndex('by_template_status_sortOrder', (q) =>
				q.eq('isTemplate', true).eq('status', 'active')
			)
			.collect();
	}
});

export const getActiveBuilderTemplateBySlug = query({
	args: {
		slug: v.string()
	},
	handler: async (ctx, { slug }) => {
		const card = await ctx.db
			.query('builderCards')
			.withIndex('by_slug_status', (q) => q.eq('slug', slug).eq('status', 'active'))
			.unique();

		if (!card) {
			return null;
		}

		const guide = await ctx.db
			.query('builderGuides')
			.withIndex('by_cardSlug', (q) => q.eq('cardSlug', card.slug))
			.unique();

		return {
			card,
			guide
		};
	}
});
