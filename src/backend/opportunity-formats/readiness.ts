export type OpportunityFormatRule = {
	id: string;
	text: string;
};

export type OpportunityFormatActivationBlocker = {
	code: 'missingRules';
	message: string;
};

export type OpportunityFormatReadiness = {
	canActivate: boolean;
	activationBlockers: OpportunityFormatActivationBlocker[];
};

const MISSING_RULES_MESSAGE = 'Add at least one rule before activating this format.';

export function normalizeOpportunityFormatRules(rules: OpportunityFormatRule[]) {
	return rules
		.map((rule) => ({
			id: rule.id.trim(),
			text: rule.text.trim()
		}))
		.filter((rule) => rule.id && rule.text);
}

export function getOpportunityFormatReadiness(
	rules: OpportunityFormatRule[]
): OpportunityFormatReadiness {
	const normalizedRules = normalizeOpportunityFormatRules(rules);
	const activationBlockers: OpportunityFormatActivationBlocker[] = [];

	if (normalizedRules.length === 0) {
		activationBlockers.push({
			code: 'missingRules',
			message: MISSING_RULES_MESSAGE
		});
	}

	return {
		canActivate: activationBlockers.length === 0,
		activationBlockers
	};
}
