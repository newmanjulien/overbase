import {
	createDefaultEmailDraft,
	type EmailDraft
} from '@overbase/builder-sdk/email';
import type {
	FormatRecipientRef,
	OpportunityFeedback,
	OpportunityFormatRule
} from './opportunity-format-detail-types';

type OpportunityFormatDetailSnapshot = {
	opportunityFormat: {
		id: string;
		emailDraft: EmailDraft;
		emailDraftVersion: number;
		rules: OpportunityFormatRule[];
		recipientRefs: FormatRecipientRef[];
		updatedAt: number;
	};
	feedback: Array<{
		opportunityId: string;
		likedText: string;
		improvementText: string;
	}>;
	feedbackUpdatedAt: number;
	opportunities: unknown[];
};

const EMPTY_FEEDBACK: OpportunityFeedback = {
	likedText: '',
	improvementText: ''
};

function cloneRules(rules: OpportunityFormatRule[]) {
	return rules.map((rule) => ({ ...rule }));
}

function cloneFeedback(feedback: OpportunityFeedback) {
	return { ...feedback };
}

function areRulesEqual(firstRules: OpportunityFormatRule[], secondRules: OpportunityFormatRule[]) {
	return JSON.stringify(firstRules) === JSON.stringify(secondRules);
}

export function areOpportunityFormatRulesFilled(rules: OpportunityFormatRule[]) {
	return rules.every((rule) => rule.text.trim().length > 0);
}

function areFeedbackEqual(
	firstFeedback: OpportunityFeedback,
	secondFeedback: OpportunityFeedback
) {
	return (
		firstFeedback.likedText === secondFeedback.likedText &&
		firstFeedback.improvementText === secondFeedback.improvementText
	);
}

export function createOpportunityFormatDetailState() {
	let syncedOpportunityFormatId = $state<string | null>(null);
	let syncedEmailDraftVersion = $state(0);
	let syncedRulesUpdatedAt = $state(0);
	let syncedRecipientsUpdatedAt = $state(0);
	let syncedFeedbackUpdatedAt = $state(-1);
	let emailDraft = $state<EmailDraft>(createDefaultEmailDraft());
	let emailDraftVersion = $state(0);
	let rulesDraft = $state<OpportunityFormatRule[]>([]);
	let savedRules = $state<OpportunityFormatRule[]>([]);
	let selectedRecipientRefs = $state<FormatRecipientRef[]>([]);
	let selectedOpportunityIndex = $state(0);
	let feedbackDraftsByOpportunityId = $state<Record<string, OpportunityFeedback>>({});
	let savedFeedbackByOpportunityId = $state<Record<string, OpportunityFeedback>>({});

	function hasRuleChanges() {
		return !areRulesEqual(rulesDraft, savedRules);
	}

	function canSaveRules() {
		return hasRuleChanges() && areOpportunityFormatRulesFilled(rulesDraft);
	}

	function sync(
		opportunityFormatId: string,
		detail: OpportunityFormatDetailSnapshot,
		{ syncRecipients = true } = {}
	) {
		if (syncedOpportunityFormatId !== opportunityFormatId) {
			syncedOpportunityFormatId = opportunityFormatId;
			syncedEmailDraftVersion = 0;
			syncedRulesUpdatedAt = 0;
			syncedRecipientsUpdatedAt = 0;
			syncedFeedbackUpdatedAt = -1;
			selectedOpportunityIndex = 0;
		}

		if (detail.opportunityFormat.emailDraftVersion > syncedEmailDraftVersion) {
			emailDraft = detail.opportunityFormat.emailDraft;
			emailDraftVersion = detail.opportunityFormat.emailDraftVersion;
			syncedEmailDraftVersion = detail.opportunityFormat.emailDraftVersion;
		}

		if (detail.opportunityFormat.updatedAt > syncedRulesUpdatedAt && !hasRuleChanges()) {
			rulesDraft = cloneRules(detail.opportunityFormat.rules);
			savedRules = cloneRules(detail.opportunityFormat.rules);
			syncedRulesUpdatedAt = detail.opportunityFormat.updatedAt;
		}

		if (syncRecipients && detail.opportunityFormat.updatedAt > syncedRecipientsUpdatedAt) {
			selectedRecipientRefs = [...detail.opportunityFormat.recipientRefs];
			syncedRecipientsUpdatedAt = detail.opportunityFormat.updatedAt;
		}

		if (detail.feedbackUpdatedAt !== syncedFeedbackUpdatedAt) {
			const nextFeedback = Object.fromEntries(
				detail.feedback.map((feedback) => [
					feedback.opportunityId,
					{
						likedText: feedback.likedText,
						improvementText: feedback.improvementText
					}
				])
			);
			feedbackDraftsByOpportunityId = nextFeedback;
			savedFeedbackByOpportunityId = nextFeedback;
			syncedFeedbackUpdatedAt = detail.feedbackUpdatedAt;
		}

		if (selectedOpportunityIndex >= detail.opportunities.length) {
			selectedOpportunityIndex = Math.max(0, detail.opportunities.length - 1);
		}
	}

	function markEmailDraftSaved(nextEmailDraft: EmailDraft, nextEmailDraftVersion: number) {
		emailDraft = nextEmailDraft;
		emailDraftVersion = nextEmailDraftVersion;
		syncedEmailDraftVersion = nextEmailDraftVersion;
	}

	function updateRules(nextRules: OpportunityFormatRule[]) {
		rulesDraft = nextRules;
	}

	function markRulesSaved(nextRules: OpportunityFormatRule[], updatedAt: number) {
		rulesDraft = cloneRules(nextRules);
		savedRules = cloneRules(nextRules);
		syncedRulesUpdatedAt = updatedAt;
	}

	function updateSelectedRecipientRefs(nextRefs: FormatRecipientRef[]) {
		selectedRecipientRefs = nextRefs;
	}

	function markRecipientsSaved(nextRefs: FormatRecipientRef[], updatedAt: number) {
		selectedRecipientRefs = [...nextRefs];
		syncedRecipientsUpdatedAt = updatedAt;
	}

	function getFeedback(
		feedbackByOpportunityId: Record<string, OpportunityFeedback>,
		opportunityId: string
	) {
		return feedbackByOpportunityId[opportunityId] ?? EMPTY_FEEDBACK;
	}

	function getFeedbackDraft(opportunityId: string) {
		return getFeedback(feedbackDraftsByOpportunityId, opportunityId);
	}

	function getSavedFeedback(opportunityId: string) {
		return getFeedback(savedFeedbackByOpportunityId, opportunityId);
	}

	function canSaveFeedback(opportunityId: string) {
		return !areFeedbackEqual(getFeedbackDraft(opportunityId), getSavedFeedback(opportunityId));
	}

	function updateFeedback(opportunityId: string, patch: Partial<OpportunityFeedback>) {
		feedbackDraftsByOpportunityId = {
			...feedbackDraftsByOpportunityId,
			[opportunityId]: {
				...getFeedbackDraft(opportunityId),
				...patch
			}
		};
	}

	function markFeedbackSaved(opportunityId: string, feedback: OpportunityFeedback) {
		feedbackDraftsByOpportunityId = {
			...feedbackDraftsByOpportunityId,
			[opportunityId]: cloneFeedback(feedback)
		};
		savedFeedbackByOpportunityId = {
			...savedFeedbackByOpportunityId,
			[opportunityId]: cloneFeedback(feedback)
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
		get selectedOpportunityIndex() {
			return selectedOpportunityIndex;
		},
		set selectedOpportunityIndex(index: number) {
			selectedOpportunityIndex = index;
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

export type OpportunityFormatDetailState = ReturnType<typeof createOpportunityFormatDetailState>;
