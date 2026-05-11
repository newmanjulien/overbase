import type { NotificationRule } from './notification-detail-types';

export function areNotificationRulesFilled(rules: NotificationRule[]) {
	return rules.every((rule) => rule.text.trim().length > 0);
}
