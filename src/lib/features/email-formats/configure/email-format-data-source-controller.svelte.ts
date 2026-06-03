import type { EmailFormatRuleDataSourceAction } from '$domain/email-formats/data-source-actions';
import type { EmailFormatRule } from './email-format-configure-types';

export class EmailFormatDataSourceController {
	linkExistingModalOpen = $state(false);
	activeRule = $state<EmailFormatRule | null>(null);

	getAction(
		actions: readonly EmailFormatRuleDataSourceAction[],
		ruleId: string | null
	) {
		if (!ruleId) {
			return null;
		}

		return actions.find((action) => action.ruleId === ruleId) ?? null;
	}

	getActivationBlockerAction(
		actions: readonly EmailFormatRuleDataSourceAction[]
	) {
		return (
			actions.find(
				(action) => action.kind === 'linkedinContacts' && !action.disabled
			) ?? null
		);
	}

	openRule(
		actions: readonly EmailFormatRuleDataSourceAction[],
		rule: EmailFormatRule
	) {
		const action = this.getAction(actions, rule.id);

		if (!action || action.disabled) {
			return false;
		}

		this.activeRule = rule;
		this.linkExistingModalOpen = true;
		return true;
	}

	openActivationBlockerAction(
		actions: readonly EmailFormatRuleDataSourceAction[],
		rules: readonly EmailFormatRule[]
	) {
		const action = this.getActivationBlockerAction(actions);
		const rule = action ? rules.find((savedRule) => savedRule.id === action.ruleId) : null;

		return rule ? this.openRule(actions, rule) : false;
	}

	closeLinkExistingModal() {
		this.linkExistingModalOpen = false;
		this.activeRule = null;
	}
}
