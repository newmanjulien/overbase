import {
	BUILDER_STARTING_POINT_SELECTION_SKIPPED_ANSWER,
	cloneBuilderEmailContent,
	type BuilderStartingPointSelectionAnswers,
	type BuilderStartingPointSelectionRule,
	type GuidedStartingPointSelection
} from '$lib/features/builder/domain';
import {
	type BuilderStartingPoint,
	type BuilderRegistryEntry
} from './types';

export function resolveBuilderContent(
	builder: BuilderRegistryEntry,
	answers: BuilderStartingPointSelectionAnswers
): BuilderStartingPoint | null {
	const { startingPointSelection } = builder;

	if (startingPointSelection.kind === 'fixed-starting-point') {
		return cloneBuilderStartingPointById(builder, startingPointSelection.startingPointId);
	}

	if (!hasAnsweredEveryStartingPointSelectionQuestion(startingPointSelection, answers)) {
		return null;
	}

	let bestRule: BuilderStartingPointSelectionRule | null = null;
	let bestSpecificity = -1;

	// Highest answer specificity wins. Starting point rules with equal specificity keep registry order.
	for (const rule of startingPointSelection.rules) {
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

	return cloneBuilderStartingPointById(builder, bestRule.startingPointId);
}

function hasAnsweredEveryStartingPointSelectionQuestion(
	startingPointSelection: GuidedStartingPointSelection,
	answers: BuilderStartingPointSelectionAnswers
) {
	return startingPointSelection.questions.every((question) =>
		answers[question.id] === BUILDER_STARTING_POINT_SELECTION_SKIPPED_ANSWER ||
		question.options.some((option) => option.id === answers[question.id])
	);
}

function getRuleSpecificity(
	rule: BuilderStartingPointSelectionRule,
	answers: BuilderStartingPointSelectionAnswers
) {
	let specificity = 0;

	for (const [questionId, optionId] of Object.entries(rule.answers)) {
		if (answers[questionId] !== optionId) {
			return -1;
		}

		specificity += 1;
	}

	return specificity;
}

function cloneBuilderStartingPoint(
	startingPoint: BuilderStartingPoint
): BuilderStartingPoint {
	return {
		id: startingPoint.id,
		label: startingPoint.label,
		ruleDataSourceAction: startingPoint.ruleDataSourceAction
			? { ...startingPoint.ruleDataSourceAction }
			: undefined,
		emailContent: cloneBuilderEmailContent(startingPoint.emailContent)
	};
}

function cloneBuilderStartingPointById(
	builder: BuilderRegistryEntry,
	startingPointId: string
) {
	const startingPoint = builder.startingPoints.find((entry) => entry.id === startingPointId);

	return startingPoint ? cloneBuilderStartingPoint(startingPoint) : null;
}
