export type EmailFormatRule = {
	id: string;
	text: string;
};

export type EmailFormatActivationBlocker = {
	code: 'missingRules';
	message: string;
};

export type EmailFormatReadiness = {
	canActivate: boolean;
	activationBlockers: EmailFormatActivationBlocker[];
};

const MISSING_RULES_MESSAGE = 'Add at least one rule before activating this email format.';

export function normalizeEmailFormatRules(rules: EmailFormatRule[]) {
	return rules
		.map((rule) => ({
			id: rule.id.trim(),
			text: rule.text.trim()
		}))
		.filter((rule) => rule.id && rule.text);
}

export function getEmailFormatReadiness(
	rules: EmailFormatRule[]
): EmailFormatReadiness {
	const normalizedRules = normalizeEmailFormatRules(rules);
	const activationBlockers: EmailFormatActivationBlocker[] = [];

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
