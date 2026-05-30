import type { BuilderArtwork } from './artwork';
import { cloneBuilderEmailContent, type BuilderEmailContent } from './email-content';
import {
	BUILDER_SETUP_SKIPPED_ANSWER,
	type BuilderSetup,
	type BuilderSetupAnswers
} from './setup';
import type { BuilderVariableDefinition } from './variables';
import { builderEntries } from './entries';

export type BuilderContentTemplate = {
	id: string;
	label: string;
	emailContent: BuilderEmailContent;
};

export type BuilderResolutionRule = {
	id: string;
	templateId: string;
	answers: Partial<BuilderSetupAnswers>;
};

export type BuilderRegistryEntry = {
	slug: string;
	title: string;
	description: string;
	details: {
		paragraphs: readonly [string, ...string[]];
	};
	artwork: BuilderArtwork;
	setup: BuilderSetup;
	variables: readonly BuilderVariableDefinition[];
	contentTemplates: readonly BuilderContentTemplate[];
	resolutionRules: readonly BuilderResolutionRule[];
	showInGallery: boolean;
	sortOrder: number;
	status: 'active';
};

export type BuilderGalleryEntry = Pick<
	BuilderRegistryEntry,
	'slug' | 'title' | 'description' | 'artwork'
>;

type BuilderRegistryValidationIssue = {
	builderSlug?: string;
	message: string;
};

function validateBuilderRegistry(entries: readonly BuilderRegistryEntry[]): BuilderRegistryValidationIssue[] {
	const issues: BuilderRegistryValidationIssue[] = [];
	const builderSlugs = new Set<string>();

	for (const entry of entries) {
		if (builderSlugs.has(entry.slug)) {
			issues.push({ builderSlug: entry.slug, message: `Duplicate builder slug "${entry.slug}".` });
		}

		builderSlugs.add(entry.slug);
		validateBuilderEntry(issues, entry);
	}

	return issues;
}

function validateBuilderEntry(
	issues: BuilderRegistryValidationIssue[],
	entry: BuilderRegistryEntry
) {
	addDuplicateIdIssues(
		issues,
		entry.slug,
		'question',
		entry.setup.questions.map((question) => question.id)
	);
	addDuplicateIdIssues(
		issues,
		entry.slug,
		'template',
		entry.contentTemplates.map((template) => template.id)
	);
	addDuplicateIdIssues(
		issues,
		entry.slug,
		'rule',
		entry.resolutionRules.map((rule) => rule.id)
	);
	addDuplicateIdIssues(
		issues,
		entry.slug,
		'variable',
		entry.variables.map((variable) => variable.id)
	);

	const templateIds = new Set(entry.contentTemplates.map((template) => template.id));
	const questionsById = new Map(entry.setup.questions.map((question) => [question.id, question]));
	const hasFallbackRule = entry.resolutionRules.some(
		(rule) => Object.keys(rule.answers).length === 0
	);
	const hasSkippedAnswerRule = entry.resolutionRules.some((rule) =>
		Object.values(rule.answers).includes(BUILDER_SETUP_SKIPPED_ANSWER)
	);

	if (!hasFallbackRule) {
		issues.push({
			builderSlug: entry.slug,
			message: 'Missing fallback resolution rule with empty answers.'
		});
	}

	if (!hasSkippedAnswerRule) {
		issues.push({
			builderSlug: entry.slug,
			message: 'Missing skipped setup resolution rule.'
		});
	}

	for (const question of entry.setup.questions) {
		addDuplicateIdIssues(
			issues,
			entry.slug,
			`option for question "${question.id}"`,
			question.options.map((option) => option.id)
		);
	}

	for (const rule of entry.resolutionRules) {
		if (!templateIds.has(rule.templateId)) {
			issues.push({
				builderSlug: entry.slug,
				message: `Resolution rule "${rule.id}" references unknown template "${rule.templateId}".`
			});
		}

		for (const [questionId, optionId] of Object.entries(rule.answers)) {
			const question = questionsById.get(questionId);

			if (!question) {
				issues.push({
					builderSlug: entry.slug,
					message: `Resolution rule "${rule.id}" references unknown question "${questionId}".`
				});
				continue;
			}

			if (
				optionId !== BUILDER_SETUP_SKIPPED_ANSWER &&
				!question.options.some((option) => option.id === optionId)
			) {
				issues.push({
					builderSlug: entry.slug,
					message: `Resolution rule "${rule.id}" references unknown option "${optionId}" for question "${questionId}".`
				});
			}
		}
	}

}

function addDuplicateIdIssues(
	issues: BuilderRegistryValidationIssue[],
	builderSlug: string,
	kind: string,
	ids: readonly string[]
) {
	const seen = new Set<string>();

	for (const id of ids) {
		if (seen.has(id)) {
			issues.push({ builderSlug, message: `Duplicate ${kind} id "${id}".` });
		}

		seen.add(id);
	}
}

const builderRegistryValidationIssues = validateBuilderRegistry(builderEntries);

if (builderRegistryValidationIssues.length > 0) {
	console.error(
		`Invalid builder registry:\n${builderRegistryValidationIssues
			.map((issue) => `- ${issue.builderSlug ? `${issue.builderSlug}: ` : ''}${issue.message}`)
			.join('\n')}`
	);
}

export function listBuilders() {
	return [...builderEntries]
		.filter((builder) => builder.status === 'active' && builder.showInGallery)
		.sort((left, right) => left.sortOrder - right.sortOrder);
}

export function listBuilderGalleryEntries(): BuilderGalleryEntry[] {
	return listBuilders().map(({ slug, title, description, artwork }) => ({
		slug,
		title,
		description,
		artwork
	}));
}

export function getBuilder(slug: string) {
	return builderEntries.find((builder) => builder.slug === slug && builder.status === 'active') ?? null;
}

export function resolveBuilderContent(
	builder: BuilderRegistryEntry,
	answers: BuilderSetupAnswers
): BuilderContentTemplate | null {
	if (!hasAnsweredEverySetupQuestion(builder.setup, answers)) {
		return null;
	}

	let bestRule: BuilderResolutionRule | null = null;
	let bestSpecificity = -1;

	for (const rule of builder.resolutionRules) {
		const specificity = getRuleSpecificity(rule, answers);

		if (specificity < 0 || specificity <= bestSpecificity) {
			continue;
		}

		bestRule = rule;
		bestSpecificity = specificity;
	}

	if (!bestRule) {
		return null;
	}

	const template = builder.contentTemplates.find((entry) => entry.id === bestRule?.templateId);

	return template ? cloneBuilderContentTemplate(template) : null;
}

function hasAnsweredEverySetupQuestion(setup: BuilderSetup, answers: BuilderSetupAnswers) {
	return setup.questions.every((question) =>
		answers[question.id] === BUILDER_SETUP_SKIPPED_ANSWER ||
		question.options.some((option) => option.id === answers[question.id])
	);
}

function getRuleSpecificity(rule: BuilderResolutionRule, answers: BuilderSetupAnswers) {
	let specificity = 0;

	for (const [questionId, optionId] of Object.entries(rule.answers)) {
		if (answers[questionId] !== optionId) {
			return -1;
		}

		specificity += 1;
	}

	return specificity;
}

function cloneBuilderContentTemplate(
	template: BuilderContentTemplate
): BuilderContentTemplate {
	return {
		id: template.id,
		label: template.label,
		emailContent: cloneBuilderEmailContent(template.emailContent)
	};
}
