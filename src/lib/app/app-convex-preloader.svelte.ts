import type { Id } from '$convex/_generated/dataModel';
import { getContext, setContext } from 'svelte';

const APP_CONVEX_PRELOADER_CONTEXT = Symbol('app-convex-preloader');

export type AppConvexPreloader = {
	preloadEmailFormatConfiguration: (emailFormatId: Id<'emailFormats'>) => void;
};

export function provideAppConvexPreloader(preloader: AppConvexPreloader) {
	setContext(APP_CONVEX_PRELOADER_CONTEXT, preloader);
}

export function useAppConvexPreloader() {
	return getContext<AppConvexPreloader | undefined>(APP_CONVEX_PRELOADER_CONTEXT) ?? null;
}
