import {
	createDefaultEmailDraft,
	type EmailDraft
} from '$shared/email-drafts';
import type {
	EmailFormatRecipientRef,
	EmailFeedback,
	EmailFormatRule
} from './email-format-detail-types';

type EmailFormatDetailSnapshot = {
	emailFormat: {
		id: string;
		emailDraft: EmailDraft;
		emailDraftVersion: number;
		rules: EmailFormatRule[];
		recipientRefs: EmailFormatRecipientRef[];
		updatedAt: number;
	};
	feedback: Array<{
		sentEmailId: string;
		likedText: string;
		improvementText: string;
	}>;
	feedbackUpdatedAt: number;
	sentEmails: unknown[];
};

const EMPTY_FEEDBACK: EmailFeedback = {
	likedText: '',
	improvementText: ''
};

function cloneRules(rules: EmailFormatRule[]) {
	return rules.map((rule) => ({ ...rule }));
}

function cloneFeedback(feedback: EmailFeedback) {
	return { ...feedback };
}

function areRulesEqual(firstRules: EmailFormatRule[], secondRules: EmailFormatRule[]) {
	return JSON.stringify(firstRules) === JSON.stringify(secondRules);
}

export function areEmailFormatRulesFilled(rules: EmailFormatRule[]) {
	return rules.every((rule) => rule.text.trim().length > 0);
}

function areFeedbackEqual(
	firstFeedback: EmailFeedback,
	secondFeedback: EmailFeedback
) {
	return (
		firstFeedback.likedText === secondFeedback.likedText &&
		firstFeedback.improvementText === secondFeedback.improvementText
	);
}

export function createEmailFormatDetailState() {
	let syncedEmailFormatId = $state<string | null>(null);
	let syncedEmailDraftVersion = $state(0);
	let syncedRulesUpdatedAt = $state(0);
	let syncedRecipientsUpdatedAt = $state(0);
	let syncedFeedbackUpdatedAt = $state(-1);
	let emailDraft = $state<EmailDraft>(createDefaultEmailDraft());
	let emailDraftVersion = $state(0);
	let rulesDraft = $state<EmailFormatRule[]>([]);
	let savedRules = $state<EmailFormatRule[]>([]);
	let selectedRecipientRefs = $state<EmailFormatRecipientRef[]>([]);
	let selectedSentEmailIndex = $state(0);
	let feedbackDraftsBySentEmailId = $state<Record<string, EmailFeedback>>({});
	let savedFeedbackBySentEmailId = $state<Record<string, EmailFeedback>>({});

	function hasRuleChanges() {
		return !areRulesEqual(rulesDraft, savedRules);
	}

	function canSaveRules() {
		return hasRuleChanges() && areEmailFormatRulesFilled(rulesDraft);
	}

	function sync(
		emailFormatId: string,
		detail: EmailFormatDetailSnapshot,
		{ syncRecipients = true } = {}
	) {
		if (syncedEmailFormatId !== emailFormatId) {
			syncedEmailFormatId = emailFormatId;
			syncedEmailDraftVersion = 0;
			syncedRulesUpdatedAt = 0;
			syncedRecipientsUpdatedAt = 0;
			syncedFeedbackUpdatedAt = -1;
			selectedSentEmailIndex = 0;
		}

		if (detail.emailFormat.emailDraftVersion > syncedEmailDraftVersion) {
			emailDraft = detail.emailFormat.emailDraft;
			emailDraftVersion = detail.emailFormat.emailDraftVersion;
			syncedEmailDraftVersion = detail.emailFormat.emailDraftVersion;
		}

		if (detail.emailFormat.updatedAt > syncedRulesUpdatedAt && !hasRuleChanges()) {
			rulesDraft = cloneRules(detail.emailFormat.rules);
			savedRules = cloneRules(detail.emailFormat.rules);
			syncedRulesUpdatedAt = detail.emailFormat.updatedAt;
		}

		if (syncRecipients && detail.emailFormat.updatedAt > syncedRecipientsUpdatedAt) {
			selectedRecipientRefs = [...detail.emailFormat.recipientRefs];
			syncedRecipientsUpdatedAt = detail.emailFormat.updatedAt;
		}

		if (detail.feedbackUpdatedAt !== syncedFeedbackUpdatedAt) {
			const nextFeedback = Object.fromEntries(
				detail.feedback.map((feedback) => [
					feedback.sentEmailId,
					{
						likedText: feedback.likedText,
						improvementText: feedback.improvementText
					}
				])
			);
			feedbackDraftsBySentEmailId = nextFeedback;
			savedFeedbackBySentEmailId = nextFeedback;
			syncedFeedbackUpdatedAt = detail.feedbackUpdatedAt;
		}

		if (selectedSentEmailIndex >= detail.sentEmails.length) {
			selectedSentEmailIndex = Math.max(0, detail.sentEmails.length - 1);
		}
	}

	function markEmailDraftSaved(nextEmailDraft: EmailDraft, nextEmailDraftVersion: number) {
		emailDraft = nextEmailDraft;
		emailDraftVersion = nextEmailDraftVersion;
		syncedEmailDraftVersion = nextEmailDraftVersion;
	}

	function updateRules(nextRules: EmailFormatRule[]) {
		rulesDraft = nextRules;
	}

	function markRulesSaved(nextRules: EmailFormatRule[], updatedAt: number) {
		rulesDraft = cloneRules(nextRules);
		savedRules = cloneRules(nextRules);
		syncedRulesUpdatedAt = updatedAt;
	}

	function updateSelectedRecipientRefs(nextRefs: EmailFormatRecipientRef[]) {
		selectedRecipientRefs = nextRefs;
	}

	function markRecipientsSaved(nextRefs: EmailFormatRecipientRef[], updatedAt: number) {
		selectedRecipientRefs = [...nextRefs];
		syncedRecipientsUpdatedAt = updatedAt;
	}

	function getFeedback(
		feedbackBySentEmailId: Record<string, EmailFeedback>,
		sentEmailId: string
	) {
		return feedbackBySentEmailId[sentEmailId] ?? EMPTY_FEEDBACK;
	}

	function getFeedbackDraft(sentEmailId: string) {
		return getFeedback(feedbackDraftsBySentEmailId, sentEmailId);
	}

	function getSavedFeedback(sentEmailId: string) {
		return getFeedback(savedFeedbackBySentEmailId, sentEmailId);
	}

	function canSaveFeedback(sentEmailId: string) {
		return !areFeedbackEqual(getFeedbackDraft(sentEmailId), getSavedFeedback(sentEmailId));
	}

	function updateFeedback(sentEmailId: string, patch: Partial<EmailFeedback>) {
		feedbackDraftsBySentEmailId = {
			...feedbackDraftsBySentEmailId,
			[sentEmailId]: {
				...getFeedbackDraft(sentEmailId),
				...patch
			}
		};
	}

	function markFeedbackSaved(sentEmailId: string, feedback: EmailFeedback) {
		feedbackDraftsBySentEmailId = {
			...feedbackDraftsBySentEmailId,
			[sentEmailId]: cloneFeedback(feedback)
		};
		savedFeedbackBySentEmailId = {
			...savedFeedbackBySentEmailId,
			[sentEmailId]: cloneFeedback(feedback)
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
		get selectedRecipientRefs() {
			return selectedRecipientRefs;
		},
		get selectedSentEmailIndex() {
			return selectedSentEmailIndex;
		},
		set selectedSentEmailIndex(index: number) {
			selectedSentEmailIndex = index;
		},
		canSaveFeedback,
		getFeedbackDraft,
		markEmailDraftSaved,
		markFeedbackSaved,
		markRulesSaved,
		markRecipientsSaved,
		sync,
		updateFeedback,
		updateRules,
		updateSelectedRecipientRefs
	};
}

export type EmailFormatDetailState = ReturnType<typeof createEmailFormatDetailState>;
