import type { Doc } from '$convex/_generated/dataModel';
import type { BuilderGuideDefinition } from '$lib/features/builder-guide/guide-types';

export function toBuilderGuideDefinition(
	guide: Doc<'builderGuides'> | null
): BuilderGuideDefinition | null {
	if (!guide) {
		return null;
	}

	return {
		intro: guide.intro,
		questions: guide.questions
	};
}
