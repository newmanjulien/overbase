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

async function toBuilderBlueprintView(ctx: QueryCtx, blueprint: Doc<'builderBlueprints'>) {
	if (!blueprint.artworkPresetSlug) {
		throw new Error(`Builder blueprint artwork preset slug is missing: ${blueprint.slug}`);
	}

	const artwork = await getArtworkPreset(ctx, blueprint.artworkPresetSlug);

	return {
		id: blueprint.slug,
		slug: blueprint.slug,
		categoryIds: blueprint.categoryIds,
		title: blueprint.title,
		description: blueprint.description,
		artwork
	};
}

export const listBuilderHome = query({
	args: {},
	handler: async (ctx) => {
			const [categories, blueprints] = await Promise.all([
				ctx.db.query('builderCategories').withIndex('by_sortOrder').collect(),
				ctx.db
					.query('builderBlueprints')
				.withIndex('by_gallery_status_sortOrder', (q) =>
					q.eq('showInGallery', true).eq('status', 'active')
				)
				.collect()
		]);

			return {
				categories,
				blueprints: await Promise.all(
					blueprints.map((blueprint) => toBuilderBlueprintView(ctx, blueprint))
				)
			};
		}
	});

export const getActiveBuilderBlueprintBySlug = query({
	args: {
		slug: v.string()
	},
	handler: async (ctx, { slug }) => {
		const blueprint = await ctx.db
			.query('builderBlueprints')
			.withIndex('by_slug_status', (q) => q.eq('slug', slug).eq('status', 'active'))
			.unique();

		if (!blueprint) {
			return null;
		}

		const guide = await ctx.db
			.query('builderGuides')
			.withIndex('by_blueprintSlug', (q) => q.eq('blueprintSlug', blueprint.slug))
			.unique();

		return {
			blueprint: await toBuilderBlueprintView(ctx, blueprint),
			guide
		};
	}
});
