import type { BuilderLaunchState } from '$lib/features/builder/session';
import type { HeaderParentHref } from '$lib/components/chrome/shared/route-title.svelte';

declare global {
	namespace App {
		interface PageData {
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
