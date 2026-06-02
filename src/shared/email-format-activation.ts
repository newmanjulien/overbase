import type {
	EmailFormatActivationRequirement,
	EmailFormatDataSourceRequirement
} from './email-format-definitions';

export type EmailFormatActivationMissingRequirement =
	| 'recipients'
	| 'rules'
	| 'linkedinContacts';

export type EmailFormatActivationRule = {
	text: string;
};

export type EmailFormatActivationReadiness = {
	canActivate: boolean;
	missingRequirements: EmailFormatActivationMissingRequirement[];
	message: string | null;
};

type EmailFormatActivationReadinessInput = {
	recipientCount: number;
	rules: readonly EmailFormatActivationRule[];
	requirements: readonly EmailFormatActivationRequirement[];
	dataSourceRequirements: readonly EmailFormatDataSourceRequirement[];
	externalData: EmailFormatActivationExternalDataState;
};

export type EmailFormatActivationExternalDataState = {
	linkedinContactsRuleIds: readonly string[];
};

function hasSavedRule(rules: readonly EmailFormatActivationRule[]) {
	return rules.some((rule) => rule.text.trim().length > 0);
}

function hasExternalDataRequirement(
	externalData: EmailFormatActivationExternalDataState,
	requirement: EmailFormatDataSourceRequirement
) {
	switch (requirement.kind) {
		case 'linkedinContacts':
			return externalData.linkedinContactsRuleIds.includes(requirement.ruleId);
	}
}

export function getEmailFormatActivationReadiness({
	recipientCount,
	rules,
	requirements,
	dataSourceRequirements,
	externalData
}: EmailFormatActivationReadinessInput): EmailFormatActivationReadiness {
	const missingRequirements: EmailFormatActivationMissingRequirement[] = [];

	for (const requirement of requirements) {
		if (requirement.kind === 'recipients' && recipientCount <= 0) {
			missingRequirements.push('recipients');
		}

		if (requirement.kind === 'rules' && !hasSavedRule(rules)) {
			missingRequirements.push('rules');
		}

	}

	for (const requirement of dataSourceRequirements) {
		if (requirement.requiredAt !== 'activation') {
			continue;
		}

		if (!hasExternalDataRequirement(externalData, requirement)) {
			missingRequirements.push('linkedinContacts');
		}
	}

	const uniqueMissingRequirements = [...new Set(missingRequirements)];

	return {
		canActivate: uniqueMissingRequirements.length === 0,
		missingRequirements: uniqueMissingRequirements,
		message: getEmailFormatActivationMissingMessage(uniqueMissingRequirements)
	};
}

export function getEmailFormatActivationMissingMessage(
	missingRequirements: readonly EmailFormatActivationMissingRequirement[],
) {
	const missing = new Set(missingRequirements);

	if (missing.size === 0) {
		return null;
	}

	if (missing.size === 1 && missing.has('recipients')) {
		return 'Add at least one recipient before activating this format';
	}

	if (missing.size === 1 && missing.has('rules')) {
		return 'Add and save at least one rule before activating this format';
	}

	if (missing.size === 1 && missing.has('linkedinContacts')) {
		return 'Add LinkedIn contacts to activate this format';
	}

	const labels = [
		missing.has('recipients') ? 'at least one recipient' : null,
		missing.has('rules') ? 'at least one saved rule' : null,
		missing.has('linkedinContacts') ? 'LinkedIn contacts' : null
	].filter((label): label is string => label !== null);

	return `Add ${formatList(labels)} before activating this format`;
}

export function getEmailFormatActivationMissingMessageFromError(
	error: unknown,
) {
	const errorMessage = error instanceof Error ? error.message : String(error);
	const activationMessages = [
		getEmailFormatActivationMissingMessage(['recipients', 'rules', 'linkedinContacts']),
		getEmailFormatActivationMissingMessage(['recipients', 'rules']),
		getEmailFormatActivationMissingMessage(['recipients', 'linkedinContacts']),
		getEmailFormatActivationMissingMessage(['rules', 'linkedinContacts']),
		getEmailFormatActivationMissingMessage(['recipients']),
		getEmailFormatActivationMissingMessage(['rules']),
		getEmailFormatActivationMissingMessage(['linkedinContacts'])
	].filter((message): message is string => message !== null);

	return (
		activationMessages.find((message) => errorMessage.includes(message)) ?? null
	);
}

function formatList(labels: readonly string[]) {
	if (labels.length <= 1) {
		return labels[0] ?? '';
	}

	if (labels.length === 2) {
		return `${labels[0]} and ${labels[1]}`;
	}

	return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}
