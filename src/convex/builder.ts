import { v } from 'convex/values';
import { query } from './_generated/server';
import { listBuilderHomeCategories } from '../builder-apps/registry';

export const listBuilderHome = query({
	args: {},
	handler: async (ctx) => {
		void ctx;

		return {
			categories: listBuilderHomeCategories(),
			apps: []
		};
	}
});

export const getActiveBuilderAppBySlug = query({
	args: {
		slug: v.string()
	},
	handler: async (ctx) => {
		void ctx;

		return null;
	}
});
