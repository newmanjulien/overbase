import type { BuilderGuideDefinition } from '$lib/features/builder/guide/guide-types';
import type { NotificationGuide } from '../../../../external/blueprints/content';

export function toBuilderGuideDefinition(
	guide: NotificationGuide | null
): BuilderGuideDefinition | null {
	if (!guide) {
		return null;
	}

	return {
		intro: guide.intro,
		questions: guide.questions
	};
}
