import type { BuilderAppManifest } from '@overbase/builder-sdk/app-protocol';

export function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isStringArray(value: unknown): value is readonly string[] {
	return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isNonEmptyTrimmedStringArray(value: unknown): value is readonly string[] {
	return isStringArray(value) && value.length > 0 && value.every((item) => item.trim().length > 0);
}

function isBuilderAppDetails(value: unknown) {
	return isRecord(value) && isNonEmptyTrimmedStringArray(value.paragraphs);
}

function hasValidOptionalHelpText(value: Record<string, unknown>) {
	return value.helpText === undefined || typeof value.helpText === 'string';
}

function isGuideQuestion(value: unknown) {
	if (!isRecord(value)) {
		return false;
	}

	if (
		value.type === 'choice' &&
		typeof value.id === 'string' &&
		typeof value.title === 'string' &&
		hasValidOptionalHelpText(value) &&
		isStringArray(value.options) &&
		typeof value.customAnswerPlaceholder === 'string'
	) {
		return true;
	}

	return (
		value.type === 'text' &&
		typeof value.id === 'string' &&
		typeof value.title === 'string' &&
		hasValidOptionalHelpText(value) &&
		typeof value.placeholder === 'string'
	);
}

function isGuideDefinition(value: unknown) {
	return (
		isRecord(value) &&
		typeof value.intro === 'string' &&
		Array.isArray(value.questions) &&
		value.questions.every(isGuideQuestion)
	);
}

export function isBuilderAppManifest(value: unknown): value is BuilderAppManifest {
	if (!isRecord(value)) {
		return false;
	}

	return (
		typeof value.slug === 'string' &&
		typeof value.title === 'string' &&
		typeof value.description === 'string' &&
		isBuilderAppDetails(value.details) &&
		((value.mode === 'custom' && value.guide === null) ||
			(value.mode === 'guided' && isGuideDefinition(value.guide)))
	);
}
