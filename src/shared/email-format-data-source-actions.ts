import {
	isLinkedinContactsDataSourceRequirement,
	type EmailFormatDataSourceRequirement
} from './email-format-data-source-requirements';
import {
	isEmailFormatDataSourceRequirementSatisfied,
	type EmailFormatDataSourceLinkState
} from './email-format-data-source-link-state';

export type EmailFormatRuleDataSourceAction = {
	ruleId: string;
	kind: 'linkedinContacts';
	attachMode: 'upload-new' | 'link-existing';
	label: string;
	disabled: boolean;
};

export function getEmailFormatRuleDataSourceActions(
	requirements: readonly EmailFormatDataSourceRequirement[],
	linkState: EmailFormatDataSourceLinkState
): EmailFormatRuleDataSourceAction[] {
	return requirements.flatMap((requirement) => {
		if (!isLinkedinContactsDataSourceRequirement(requirement)) {
			return [];
		}

		const linked = isEmailFormatDataSourceRequirementSatisfied(requirement, linkState);

		return [
			{
				ruleId: requirement.ruleId,
				kind: requirement.kind,
				attachMode: requirement.attachMode,
				label: linked ? requirement.linkedLabel : requirement.actionLabel,
				disabled: linked
			}
		];
	});
}
