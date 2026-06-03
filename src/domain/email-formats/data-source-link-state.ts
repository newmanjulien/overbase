import type { EmailFormatDataSourceRequirement } from './data-source-requirements';

export type EmailFormatDataSourceLinkState = {
	linkedinContactsRuleIds: readonly string[];
};

export function createEmptyEmailFormatDataSourceLinkState(): EmailFormatDataSourceLinkState {
	return {
		linkedinContactsRuleIds: []
	};
}

export function isEmailFormatDataSourceRequirementSatisfied(
	requirement: EmailFormatDataSourceRequirement,
	linkState: EmailFormatDataSourceLinkState
) {
	switch (requirement.kind) {
		case 'linkedinContacts':
			return linkState.linkedinContactsRuleIds.includes(requirement.ruleId);
		case 'linkedDataSources':
			return false;
	}
}

export function getUnsatisfiedEmailFormatDataSourceRequirements(
	requirements: readonly EmailFormatDataSourceRequirement[],
	linkState: EmailFormatDataSourceLinkState
) {
	return requirements.filter(
		(requirement) => !isEmailFormatDataSourceRequirementSatisfied(requirement, linkState)
	);
}
