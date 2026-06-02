export type EmailFormatDataSourceRequirementTiming = 'creation' | 'activation';

export type EmailFormatLinkedinContactsDataSourceRequirement = {
	id: string;
	kind: 'linkedinContacts';
	scope: 'rule';
	ruleId: string;
	requiredAt: readonly EmailFormatDataSourceRequirementTiming[];
	attachMode: 'upload-new' | 'link-existing';
	actionLabel: string;
	linkedLabel: string;
};

export type EmailFormatLinkedDataSourcesRequirement = {
	id: string;
	kind: 'linkedDataSources';
	scope: 'format';
	requiredAt: readonly ['activation'];
};

export type EmailFormatDataSourceRequirement =
	| EmailFormatLinkedinContactsDataSourceRequirement
	| EmailFormatLinkedDataSourcesRequirement;

export type EmailFormatDataSourceRequirementSet = {
	dataSourceRequirements: readonly EmailFormatDataSourceRequirement[];
};

export function isLinkedinContactsDataSourceRequirement(
	requirement: EmailFormatDataSourceRequirement
): requirement is EmailFormatLinkedinContactsDataSourceRequirement {
	return requirement.kind === 'linkedinContacts';
}

export function isLinkedDataSourcesRequirement(
	requirement: EmailFormatDataSourceRequirement
): requirement is EmailFormatLinkedDataSourcesRequirement {
	return requirement.kind === 'linkedDataSources';
}

export function getEmailFormatDataSourceRequirementForRule(
	requirementSet: EmailFormatDataSourceRequirementSet,
	ruleId: string
) {
	return (
		requirementSet.dataSourceRequirements.find(
			(requirement): requirement is EmailFormatLinkedinContactsDataSourceRequirement =>
				isLinkedinContactsDataSourceRequirement(requirement) && requirement.ruleId === ruleId
		) ?? null
	);
}

export function isEmailFormatDataSourceRequirementRequiredAt(
	requirement: EmailFormatDataSourceRequirement,
	timing: EmailFormatDataSourceRequirementTiming
) {
	const requiredAt: readonly EmailFormatDataSourceRequirementTiming[] = requirement.requiredAt;

	return requiredAt.includes(timing);
}

export function getEmailFormatCreationDataSourceRequirement(
	requirementSet: EmailFormatDataSourceRequirementSet
) {
	return (
		requirementSet.dataSourceRequirements.find(
			(requirement): requirement is EmailFormatLinkedinContactsDataSourceRequirement =>
				isLinkedinContactsDataSourceRequirement(requirement) &&
				isEmailFormatDataSourceRequirementRequiredAt(requirement, 'creation')
		) ?? null
	);
}

export function getEmailFormatActivationDataSourceRequirements(
	requirementSet: EmailFormatDataSourceRequirementSet
) {
	return requirementSet.dataSourceRequirements.filter(
		(requirement) => isEmailFormatDataSourceRequirementRequiredAt(requirement, 'activation')
	);
}
