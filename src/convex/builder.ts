import { v } from 'convex/values';
import { query } from './_generated/server';
import {
	getActiveExternalApp,
	getExternalAppGuide,
	listBuilderHomeExternalApps
} from '../lib/features/builder/external/registry';
import type { ExternalAppCatalogDefinition } from '../lib/features/builder/external/types';

function toBuilderAppView(app: ExternalAppCatalogDefinition) {
	return {
		id: app.slug,
		slug: app.slug,
		categoryIds: [...app.categoryIds],
		title: app.title,
		description: app.description,
		mode: app.mode,
		artwork: app.artwork
	};
}

export const listBuilderHome = query({
	args: {},
	handler: async (ctx) => {
		void ctx;
		const { categories, apps } = listBuilderHomeExternalApps();

		return {
			categories,
			apps: apps.map(toBuilderAppView)
		};
	}
});

export const getActiveBuilderAppBySlug = query({
	args: {
		slug: v.string()
	},
	handler: async (ctx, { slug }) => {
		void ctx;
		const app = getActiveExternalApp(slug);

		if (!app) {
			return null;
		}

		return {
			app: toBuilderAppView(app),
			guide: getExternalAppGuide(app.slug)
		};
	}
});
