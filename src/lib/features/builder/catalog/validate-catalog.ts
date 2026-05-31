import {
	isBuilderArtworkIconId,
	type BuilderEmailContent,
	type BuilderInlineNode
} from '$lib/features/builder/domain';
import { hasInlineTextContent } from '$lib/domain/inline-text';
import type { BuilderRegistryEntry } from './types';

export type BuilderCatalogValidationIssue = {
	builderSlug?: string;
	message: string;
};

export function validateBuilderCatalog(
	entries: readonly BuilderRegistryEntry[]
): BuilderCatalogValidationIssue[] {
	const issues: BuilderCatalogValidationIssue[] = [];
	const builderSlugs = new Set<string>();
	const modeSortOrders = new Map<BuilderRegistryEntry['mode'], Map<number, string>>();

	for (const entry of entries) {
		if (builderSlugs.has(entry.slug)) {
			issues.push({
				builderSlug: entry.slug,
				message: `Duplicate builder slug "${entry.slug}".`
			});
		}

		builderSlugs.add(entry.slug);

		const sortOrdersForMode = modeSortOrders.get(entry.mode) ?? new Map<number, string>();
		const existingSortOrderSlug = sortOrdersForMode.get(entry.modeSortOrder);

		if (existingSortOrderSlug) {
			issues.push({
				builderSlug: entry.slug,
				message: `Duplicate modeSortOrder "${entry.modeSortOrder}" for builder mode "${entry.mode}" also used by builder "${existingSortOrderSlug}".`
			});
		}

		sortOrdersForMode.set(entry.modeSortOrder, entry.slug);
		modeSortOrders.set(entry.mode, sortOrdersForMode);
		validateBuilderEntry(issues, entry);
	}

	return issues;
}

function validateBuilderEntry(
	issues: BuilderCatalogValidationIssue[],
	entry: BuilderRegistryEntry
) {
	addDuplicateIdIssues(
		issues,
		entry.slug,
		'starting point',
		entry.startingPoints.map((startingPoint) => startingPoint.id)
	);
	addDuplicateIdIssues(
		issues,
		entry.slug,
		'variable',
		entry.variables.map((variable) => variable.id)
	);

	const startingPointIds = new Set(entry.startingPoints.map((startingPoint) => startingPoint.id));
	const variableIds = new Set(entry.variables.map((variable) => variable.id));

	validateBuilderStartingPointSelection(issues, entry, startingPointIds);

	if (entry.mode === 'public-data') {
		addDuplicateIdIssues(
			issues,
			entry.slug,
			'initial email-format rule',
			entry.initialRules.map((rule) => rule.id)
		);

		if (!entry.ruleDataSourceAction.label.trim()) {
			issues.push({
				builderSlug: entry.slug,
				message: 'Public-data builders must define a rule data-source action label.'
			});
		}

		if (!entry.ruleInfoCard.label.trim() || !hasInlineTextContent(entry.ruleInfoCard.content)) {
			issues.push({
				builderSlug: entry.slug,
				message: 'Public-data builders must define rule info-card copy.'
			});
		}

		if (entry.initialRules.length === 0) {
			issues.push({
				builderSlug: entry.slug,
				message: 'Public-data builders must define at least one initial email-format rule.'
			});
		}

		for (const rule of entry.initialRules) {
			if (!rule.id.trim()) {
				issues.push({
					builderSlug: entry.slug,
					message:
						'Public-data builders cannot define an initial email-format rule with an empty id.'
				});
			}

			if (!rule.text.trim()) {
				issues.push({
					builderSlug: entry.slug,
					message: `Initial email-format rule "${rule.id}" must include text.`
				});
			}
		}
	}

	if (!isBuilderArtworkIconId(entry.artwork.iconId)) {
		issues.push({
			builderSlug: entry.slug,
			message: `Artwork references unknown icon "${entry.artwork.iconId}".`
		});
	}

	for (const startingPoint of entry.startingPoints) {
		if (startingPoint.ruleDataSourceAction && entry.mode !== 'public-data') {
			issues.push({
				builderSlug: entry.slug,
				message: `Starting point "${startingPoint.id}" defines a rule data-source action override on a non-public-data builder.`
			});
		}

		if (startingPoint.ruleDataSourceAction && !startingPoint.ruleDataSourceAction.label.trim()) {
			issues.push({
				builderSlug: entry.slug,
				message: `Starting point "${startingPoint.id}" must define a rule data-source action override label.`
			});
		}

		for (const variableId of listEmailContentVariableIds(startingPoint.emailContent)) {
			if (!variableIds.has(variableId)) {
				issues.push({
					builderSlug: entry.slug,
					message: `Starting point "${startingPoint.id}" references unknown variable "${variableId}".`
				});
			}
		}
	}
}

function validateBuilderStartingPointSelection(
	issues: BuilderCatalogValidationIssue[],
	entry: BuilderRegistryEntry,
	startingPointIds: ReadonlySet<string>
) {
	const { startingPointSelection } = entry;

	if (startingPointSelection.kind === 'fixed-starting-point') {
		if (!startingPointIds.has(startingPointSelection.startingPointId)) {
			issues.push({
				builderSlug: entry.slug,
				message: `Fixed starting point selection references unknown starting point "${startingPointSelection.startingPointId}".`
			});
		}

		return;
	}

	addDuplicateIdIssues(
		issues,
		entry.slug,
		'question',
		startingPointSelection.questions.map((question) => question.id)
	);
	addDuplicateIdIssues(
		issues,
		entry.slug,
		'starting point rule',
		startingPointSelection.rules.map((rule) => rule.id)
	);

	const questionsById = new Map(
		startingPointSelection.questions.map((question) => [question.id, question])
	);
	const hasFallbackRule = startingPointSelection.rules.some(
		(rule) => Object.keys(rule.answers).length === 0
	);

	if (startingPointSelection.questions.length === 0) {
		issues.push({
			builderSlug: entry.slug,
			message: 'Guided starting point selection must include at least one question.'
		});
	}

	if (!hasFallbackRule) {
		issues.push({
			builderSlug: entry.slug,
			message: 'Missing fallback starting point rule with empty answers.'
		});
	}

	if (
		startingPointSelection.infoBar &&
		(!startingPointSelection.infoBar.label.trim() ||
			!hasInlineTextContent(startingPointSelection.infoBar.content))
	) {
		issues.push({
			builderSlug: entry.slug,
			message: 'Guided starting point selection info bars must define label and content.'
		});
	}

	for (const question of startingPointSelection.questions) {
		addDuplicateIdIssues(
			issues,
			entry.slug,
			`option for question "${question.id}"`,
			question.options.map((option) => option.id)
		);
	}

	for (const rule of startingPointSelection.rules) {
		if (!startingPointIds.has(rule.startingPointId)) {
			issues.push({
				builderSlug: entry.slug,
				message: `Starting point rule "${rule.id}" references unknown starting point "${rule.startingPointId}".`
			});
		}

		for (const [questionId, optionId] of Object.entries(rule.answers)) {
			const question = questionsById.get(questionId);

			if (!question) {
				issues.push({
					builderSlug: entry.slug,
					message: `Starting point rule "${rule.id}" references unknown question "${questionId}".`
				});
				continue;
			}

			if (!question.options.some((option) => option.id === optionId)) {
				issues.push({
					builderSlug: entry.slug,
					message: `Starting point rule "${rule.id}" references unknown option "${optionId}" for question "${questionId}".`
				});
			}
		}
	}
}

function addDuplicateIdIssues(
	issues: BuilderCatalogValidationIssue[],
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

function listEmailContentVariableIds(content: BuilderEmailContent) {
	const variableIds = new Set<string>();

	for (const block of content.body) {
		addInlineVariableIds(variableIds, block.content);
	}

	for (const cell of Object.values(content.attachment?.cellsByKey ?? {})) {
		addInlineVariableIds(variableIds, cell);
	}

	return variableIds;
}

function addInlineVariableIds(variableIds: Set<string>, nodes: readonly BuilderInlineNode[]) {
	for (const node of nodes) {
		if (node.type === 'variable') {
			variableIds.add(node.variableId);
		}
	}
}
