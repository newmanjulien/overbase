import type { BlueprintArtwork } from './artwork';
import { cloneBlueprintEmailContent, type BlueprintEmailContent } from './email-content';
import {
	BLUEPRINT_SETUP_SKIPPED_ANSWER,
	type BlueprintSetup,
	type BlueprintSetupAnswers
} from './setup';
import type { BlueprintVariableDefinition } from './variables';
import { blueprintEntries } from './entries';

export type BlueprintContentTemplate = {
	id: string;
	label: string;
	emailContent: BlueprintEmailContent;
};

export type BlueprintResolutionRule = {
	id: string;
	templateId: string;
	answers: Partial<BlueprintSetupAnswers>;
};

export type BlueprintRegistryEntry = {
	slug: string;
	title: string;
	description: string;
	details: {
		paragraphs: readonly [string, ...string[]];
	};
	artwork: BlueprintArtwork;
	setup: BlueprintSetup;
	variables: readonly BlueprintVariableDefinition[];
	contentTemplates: readonly BlueprintContentTemplate[];
	resolutionRules: readonly BlueprintResolutionRule[];
	showInGallery: boolean;
	sortOrder: number;
	status: 'active';
};

export type BlueprintRegistryValidationIssue = {
	blueprintSlug?: string;
	message: string;
};

export function validateBlueprintRegistry(
	entries: readonly BlueprintRegistryEntry[]
): BlueprintRegistryValidationIssue[] {
	const issues: BlueprintRegistryValidationIssue[] = [];
	const blueprintSlugs = new Set<string>();

	for (const entry of entries) {
		if (blueprintSlugs.has(entry.slug)) {
			issues.push({ blueprintSlug: entry.slug, message: `Duplicate blueprint slug "${entry.slug}".` });
		}

		blueprintSlugs.add(entry.slug);
		validateBlueprintEntry(issues, entry);
	}

	return issues;
}

function validateBlueprintEntry(
	issues: BlueprintRegistryValidationIssue[],
	entry: BlueprintRegistryEntry
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
		Object.values(rule.answers).includes(BLUEPRINT_SETUP_SKIPPED_ANSWER)
	);

	if (!hasFallbackRule) {
		issues.push({
			blueprintSlug: entry.slug,
			message: 'Missing fallback resolution rule with empty answers.'
		});
	}

	if (!hasSkippedAnswerRule) {
		issues.push({
			blueprintSlug: entry.slug,
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
				blueprintSlug: entry.slug,
				message: `Resolution rule "${rule.id}" references unknown template "${rule.templateId}".`
			});
		}

		for (const [questionId, optionId] of Object.entries(rule.answers)) {
			const question = questionsById.get(questionId);

			if (!question) {
				issues.push({
					blueprintSlug: entry.slug,
					message: `Resolution rule "${rule.id}" references unknown question "${questionId}".`
				});
				continue;
			}

			if (
				optionId !== BLUEPRINT_SETUP_SKIPPED_ANSWER &&
				!question.options.some((option) => option.id === optionId)
			) {
				issues.push({
					blueprintSlug: entry.slug,
					message: `Resolution rule "${rule.id}" references unknown option "${optionId}" for question "${questionId}".`
				});
			}
		}
	}

}

function addDuplicateIdIssues(
	issues: BlueprintRegistryValidationIssue[],
	blueprintSlug: string,
	kind: string,
	ids: readonly string[]
) {
	const seen = new Set<string>();

	for (const id of ids) {
		if (seen.has(id)) {
			issues.push({ blueprintSlug, message: `Duplicate ${kind} id "${id}".` });
		}

		seen.add(id);
	}
}

export const blueprintRegistryValidationIssues = validateBlueprintRegistry(blueprintEntries);

if (blueprintRegistryValidationIssues.length > 0) {
	console.error(
		`Invalid blueprint registry:\n${blueprintRegistryValidationIssues
			.map((issue) => `- ${issue.blueprintSlug ? `${issue.blueprintSlug}: ` : ''}${issue.message}`)
			.join('\n')}`
	);
}

export function listBlueprints() {
	return [...blueprintEntries]
		.filter((blueprint) => blueprint.status === 'active' && blueprint.showInGallery)
		.sort((left, right) => left.sortOrder - right.sortOrder);
}

export function getBlueprint(slug: string) {
	return blueprintEntries.find((blueprint) => blueprint.slug === slug && blueprint.status === 'active') ?? null;
}

export function resolveBlueprintContent(
	blueprint: BlueprintRegistryEntry,
	answers: BlueprintSetupAnswers
): BlueprintContentTemplate | null {
	if (!hasAnsweredEverySetupQuestion(blueprint.setup, answers)) {
		return null;
	}

	let bestRule: BlueprintResolutionRule | null = null;
	let bestSpecificity = -1;

	for (const rule of blueprint.resolutionRules) {
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

	const template = blueprint.contentTemplates.find((entry) => entry.id === bestRule?.templateId);

	return template ? cloneBlueprintContentTemplate(template) : null;
}

function hasAnsweredEverySetupQuestion(setup: BlueprintSetup, answers: BlueprintSetupAnswers) {
	return setup.questions.every((question) =>
		answers[question.id] === BLUEPRINT_SETUP_SKIPPED_ANSWER ||
		question.options.some((option) => option.id === answers[question.id])
	);
}

function getRuleSpecificity(rule: BlueprintResolutionRule, answers: BlueprintSetupAnswers) {
	let specificity = 0;

	for (const [questionId, optionId] of Object.entries(rule.answers)) {
		if (answers[questionId] !== optionId) {
			return -1;
		}

		specificity += 1;
	}

	return specificity;
}

function cloneBlueprintContentTemplate(
	template: BlueprintContentTemplate
): BlueprintContentTemplate {
	return {
		id: template.id,
		label: template.label,
		emailContent: cloneBlueprintEmailContent(template.emailContent)
	};
}
