import type { BuilderLaunchState } from '$lib/features/builder/session';
import type { HeaderParentHref } from '$lib/components/chrome/shared/route-title.svelte';
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
			headerParent?: {
				label: string;
				href: HeaderParentHref;
			};
			headerParentVisibility?: 'all' | 'desktopOnly';
		}

		interface PageState {
			builderLaunch?: BuilderLaunchState;
		}
	}
}

export {};
