import { v } from 'convex/values';
import { query } from './_generated/server';
import {
	getActiveBuilderAppManifest,
	getBuilderAppGuide,
	listBuilderHomeApps
} from '../builder-apps/registry';
import type { BuilderAppManifest } from '@overbase/builder-sdk/app-protocol';

function toBuilderAppView(app: BuilderAppManifest) {
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
		const { categories, apps } = listBuilderHomeApps();

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
		const app = getActiveBuilderAppManifest(slug);

		if (!app) {
			return null;
		}

		return {
			app: toBuilderAppView(app),
			guide: getBuilderAppGuide(app.slug)
		};
	}
});
