import type { BuilderGuideQuestion } from '$lib/features/builder/guide/guide-types';

export function getGuideQuestionHelpText(question: BuilderGuideQuestion) {
	if (question.type === 'choice') {
		return 'Pick the closest option. If none of the options fit, add a short custom note below so the builder has the right context.';
	}

	return 'Answer with the specific detail this notification should use. A short, concrete answer is enough.';
}
