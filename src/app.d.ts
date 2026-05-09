import type { BuilderLaunchState } from '$lib/features/builder/session/builder-launch';

declare global {
	namespace App {
		interface PageData {
			headerTitle?: string;
			headerTitleEditable?: boolean;
		}

		interface PageState {
			builderLaunch?: BuilderLaunchState;
		}
	}
}

export {};
