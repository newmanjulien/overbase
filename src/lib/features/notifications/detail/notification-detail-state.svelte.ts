import {
	createDefaultEmailDraft,
	type EmailDraft
} from '@overbase/builder-sdk/email';
import { areNotificationRulesFilled } from './notification-detail-rules';
import type { NotificationRule } from './notification-detail-types';

export type NotificationEmailFeedback = {
	likedText: string;
	improvementText: string;
};

type NotificationDetailSnapshot = {
	notification: {
		id: string;
		emailDraft: EmailDraft;
		emailDraftVersion: number;
		rules: NotificationRule[];
		teamMemberIds: string[];
		updatedAt: number;
	};
	feedback: Array<{
		emailId: string;
		likedText: string;
		improvementText: string;
	}>;
	feedbackUpdatedAt: number;
	emails: unknown[];
};

const EMPTY_FEEDBACK: NotificationEmailFeedback = {
	likedText: '',
	improvementText: ''
};

function cloneRules(rules: NotificationRule[]) {
	return rules.map((rule) => ({ ...rule }));
}

function cloneFeedback(feedback: NotificationEmailFeedback) {
	return { ...feedback };
}

function areRulesEqual(firstRules: NotificationRule[], secondRules: NotificationRule[]) {
	return JSON.stringify(firstRules) === JSON.stringify(secondRules);
}

function areFeedbackEqual(
	firstFeedback: NotificationEmailFeedback,
	secondFeedback: NotificationEmailFeedback
) {
	return (
		firstFeedback.likedText === secondFeedback.likedText &&
		firstFeedback.improvementText === secondFeedback.improvementText
	);
}

export function createNotificationDetailState() {
	let syncedNotificationId = $state<string | null>(null);
	let syncedEmailDraftVersion = $state(0);
	let syncedRulesUpdatedAt = $state(0);
	let syncedTeamMembersUpdatedAt = $state(0);
	let syncedFeedbackUpdatedAt = $state(-1);
	let emailDraft = $state<EmailDraft>(createDefaultEmailDraft());
	let emailDraftVersion = $state(0);
	let rulesDraft = $state<NotificationRule[]>([]);
	let savedRules = $state<NotificationRule[]>([]);
	let selectedTeamMemberIds = $state<string[]>([]);
	let selectedEmailIndex = $state(0);
	let feedbackDraftsByEmailId = $state<Record<string, NotificationEmailFeedback>>({});
	let savedFeedbackByEmailId = $state<Record<string, NotificationEmailFeedback>>({});

	function hasRuleChanges() {
		return !areRulesEqual(rulesDraft, savedRules);
	}

	function canSaveRules() {
		return hasRuleChanges() && areNotificationRulesFilled(rulesDraft);
	}

	function sync(
		notificationId: string,
		detail: NotificationDetailSnapshot,
		{ syncTeamMembers = true } = {}
	) {
		if (syncedNotificationId !== notificationId) {
			syncedNotificationId = notificationId;
			syncedEmailDraftVersion = 0;
			syncedRulesUpdatedAt = 0;
			syncedTeamMembersUpdatedAt = 0;
			syncedFeedbackUpdatedAt = -1;
			selectedEmailIndex = 0;
		}

		if (detail.notification.emailDraftVersion > syncedEmailDraftVersion) {
			emailDraft = detail.notification.emailDraft;
			emailDraftVersion = detail.notification.emailDraftVersion;
			syncedEmailDraftVersion = detail.notification.emailDraftVersion;
		}

		if (detail.notification.updatedAt > syncedRulesUpdatedAt && !hasRuleChanges()) {
			rulesDraft = cloneRules(detail.notification.rules);
			savedRules = cloneRules(detail.notification.rules);
			syncedRulesUpdatedAt = detail.notification.updatedAt;
		}

		if (syncTeamMembers && detail.notification.updatedAt > syncedTeamMembersUpdatedAt) {
			selectedTeamMemberIds = [...detail.notification.teamMemberIds];
			syncedTeamMembersUpdatedAt = detail.notification.updatedAt;
		}

		if (detail.feedbackUpdatedAt !== syncedFeedbackUpdatedAt) {
			const nextFeedback = Object.fromEntries(
				detail.feedback.map((feedback) => [
					feedback.emailId,
					{
						likedText: feedback.likedText,
						improvementText: feedback.improvementText
					}
				])
			);
			feedbackDraftsByEmailId = nextFeedback;
			savedFeedbackByEmailId = nextFeedback;
			syncedFeedbackUpdatedAt = detail.feedbackUpdatedAt;
		}

		if (selectedEmailIndex >= detail.emails.length) {
			selectedEmailIndex = Math.max(0, detail.emails.length - 1);
		}
	}

	function markEmailDraftSaved(nextEmailDraft: EmailDraft, nextEmailDraftVersion: number) {
		emailDraft = nextEmailDraft;
		emailDraftVersion = nextEmailDraftVersion;
		syncedEmailDraftVersion = nextEmailDraftVersion;
	}

	function updateRules(nextRules: NotificationRule[]) {
		rulesDraft = nextRules;
	}

	function markRulesSaved(nextRules: NotificationRule[], updatedAt: number) {
		rulesDraft = cloneRules(nextRules);
		savedRules = cloneRules(nextRules);
		syncedRulesUpdatedAt = updatedAt;
	}

	function updateSelectedTeamMemberIds(nextIds: string[]) {
		selectedTeamMemberIds = nextIds;
	}

	function markTeamMembersSaved(nextIds: string[], updatedAt: number) {
		selectedTeamMemberIds = [...nextIds];
		syncedTeamMembersUpdatedAt = updatedAt;
	}

	function getFeedback(
		feedbackByEmailId: Record<string, NotificationEmailFeedback>,
		emailId: string
	) {
		return feedbackByEmailId[emailId] ?? EMPTY_FEEDBACK;
	}

	function getFeedbackDraft(emailId: string) {
		return getFeedback(feedbackDraftsByEmailId, emailId);
	}

	function getSavedFeedback(emailId: string) {
		return getFeedback(savedFeedbackByEmailId, emailId);
	}

	function canSaveFeedback(emailId: string) {
		return !areFeedbackEqual(getFeedbackDraft(emailId), getSavedFeedback(emailId));
	}

	function updateFeedback(emailId: string, patch: Partial<NotificationEmailFeedback>) {
		feedbackDraftsByEmailId = {
			...feedbackDraftsByEmailId,
			[emailId]: {
				...getFeedbackDraft(emailId),
				...patch
			}
		};
	}

	function markFeedbackSaved(emailId: string, feedback: NotificationEmailFeedback) {
		feedbackDraftsByEmailId = {
			...feedbackDraftsByEmailId,
			[emailId]: cloneFeedback(feedback)
		};
		savedFeedbackByEmailId = {
			...savedFeedbackByEmailId,
			[emailId]: cloneFeedback(feedback)
		};
	}

	return {
		get emailDraft() {
			return emailDraft;
		},
		get emailDraftVersion() {
			return emailDraftVersion;
		},
		get rulesDraft() {
			return rulesDraft;
		},
		get canSaveRules() {
			return canSaveRules();
		},
		get selectedTeamMemberIds() {
			return selectedTeamMemberIds;
		},
		get selectedEmailIndex() {
			return selectedEmailIndex;
		},
		set selectedEmailIndex(index: number) {
			selectedEmailIndex = index;
		},
		canSaveFeedback,
		getFeedbackDraft,
		markEmailDraftSaved,
		markFeedbackSaved,
		markRulesSaved,
		markTeamMembersSaved,
		sync,
		updateFeedback,
		updateRules,
		updateSelectedTeamMemberIds
	};
}
