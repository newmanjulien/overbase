import type { OpportunityFormatRule } from './opportunity-format-detail-types';

export function areOpportunityFormatRulesFilled(rules: OpportunityFormatRule[]) {
	return rules.every((rule) => rule.text.trim().length > 0);
}
