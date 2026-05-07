import type { BuilderGuideDefinition } from '$lib/features/builder/guide/guide-types';
import type { ExternalGuideDefinition } from '$lib/features/builder/external';

export function toBuilderGuideDefinition(
	guide: (ExternalGuideDefinition & { appSlug: string }) | null
): BuilderGuideDefinition | null {
	if (!guide) {
		return null;
	}

	return {
		intro: guide.intro,
		questions: guide.questions
	};
}
