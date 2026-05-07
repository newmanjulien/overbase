import { v } from 'convex/values';
import { query } from './_generated/server';
import {
	getActiveNotificationProduct,
	getNotificationArtworkPreset,
	getNotificationGuide,
	listNotificationHomeProducts,
	type NotificationProduct
} from '../external/blueprints/content';

function toNotificationProductView(product: NotificationProduct) {
	const artwork = getNotificationArtworkPreset(product.artworkPresetSlug);

	if (!artwork) {
		throw new Error(`Notification artwork preset not found: ${product.artworkPresetSlug}`);
	}

	return {
		id: product.slug,
		slug: product.slug,
		categoryIds: [...product.categoryIds],
		title: product.title,
		description: product.description,
		mode: product.mode,
		artwork
	};
}

export const listBuilderHome = query({
	args: {},
	handler: async (ctx) => {
		void ctx;
		const { categories, products } = listNotificationHomeProducts();

		return {
			categories,
			blueprints: products.map(toNotificationProductView)
		};
	}
});

export const getActiveBuilderBlueprintBySlug = query({
	args: {
		slug: v.string()
	},
	handler: async (ctx, { slug }) => {
		void ctx;
		const product = getActiveNotificationProduct(slug);

		if (!product) {
			return null;
		}

		return {
			blueprint: toNotificationProductView(product),
			guide: getNotificationGuide(product.slug)
		};
	}
});
