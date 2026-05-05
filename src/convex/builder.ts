import { v } from 'convex/values';
import { query, type QueryCtx } from './_generated/server';
import type { Doc } from './_generated/dataModel';

async function getArtworkPreset(ctx: QueryCtx, slug: string) {
	const artwork = await ctx.db
		.query('builderArtworkPresets')
		.withIndex('by_slug', (q) => q.eq('slug', slug))
		.unique();

	if (!artwork) {
		throw new Error(`Builder artwork preset not found: ${slug}`);
	}

	return artwork;
}

async function toBuilderCardView(ctx: QueryCtx, card: Doc<'builderCards'>) {
	if (!card.artworkPresetSlug) {
		throw new Error(`Builder card artwork preset slug is missing: ${card.slug}`);
	}

	const artwork = await getArtworkPreset(ctx, card.artworkPresetSlug);

	return {
		id: card.slug,
		slug: card.slug,
		categoryIds: card.categoryIds,
		title: card.title,
		description: card.description,
		artwork
	};
}

export const listBuilderHome = query({
	args: {},
	handler: async (ctx) => {
		const [categories, cards] = await Promise.all([
			ctx.db.query('builderCategories').withIndex('by_sortOrder').collect(),
			ctx.db
				.query('builderCards')
				.withIndex('by_template_status_sortOrder', (q) =>
					q.eq('isTemplate', true).eq('status', 'active')
				)
				.collect()
		]);

		return {
			categories,
			cards: await Promise.all(cards.map((card) => toBuilderCardView(ctx, card)))
		};
	}
});

export const getActiveBuilderCardBySlug = query({
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
			card: await toBuilderCardView(ctx, card),
			guide
		};
	}
});
