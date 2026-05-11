export type NotificationRule = {
	id: string;
	text: string;
};

export type NotificationActivationBlocker = {
	code: 'missingRules';
	message: string;
};

export type NotificationReadiness = {
	canActivate: boolean;
	activationBlockers: NotificationActivationBlocker[];
};

const MISSING_RULES_MESSAGE = 'Add at least one rule before activating this notification.';

export function normalizeNotificationRules(rules: NotificationRule[]) {
	return rules
		.map((rule) => ({
			id: rule.id.trim(),
			text: rule.text.trim()
		}))
		.filter((rule) => rule.id && rule.text);
}

export function getNotificationReadiness(rules: NotificationRule[]): NotificationReadiness {
	const normalizedRules = normalizeNotificationRules(rules);
	const activationBlockers: NotificationActivationBlocker[] = [];

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
