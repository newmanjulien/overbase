import type { BuilderLaunchState } from '$lib/features/builder/session';
import type { BreadcrumbParent } from '$lib/app/chrome/shared/breadcrumb';
import type { BuilderViewportFallbackPathname } from '$lib/app/app-links';
import type { AuthObject } from 'svelte-clerk/server';

declare global {
	namespace App {
		interface Locals {
			auth: () => AuthObject;
		}

		interface PageData {
			chromeMode?: 'dashboard' | 'focused';
			headerTitle?: string;
			headerTitleEditable?: boolean;
			desktopBreadcrumbParent?: BreadcrumbParent;
			viewportRequirement?: {
				minWidth: 'desktop';
				fallbackHref: BuilderViewportFallbackPathname;
			};
		}

		interface PageState {
			builderLaunch?: BuilderLaunchState;
		}
	}
}

export {};
