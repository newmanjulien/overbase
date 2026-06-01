import {
	cloneBuilderEmailContent,
	type BuilderEmailContent
} from '$lib/features/builder/domain';
import { BuilderEditorState } from '$lib/features/builder/workbench/state/builder-editor-state.svelte';
import type {
	EmailFormatContent,
	EmailFormatRecipientRef,
	EmailFeedback,
	EmailFormatRule
} from './email-format-detail-types';
import { getFormatRecipientKey } from './email-format-detail-types';

type EmailFormatDetailSnapshot = {
	emailFormat: {
		id: string;
		content: EmailFormatContent;
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

function cloneRecipientRefs(refs: EmailFormatRecipientRef[]) {
	return refs.map((ref) => ({ ...ref }));
}

function areRecipientRefsEqual(
	firstRefs: EmailFormatRecipientRef[],
	secondRefs: EmailFormatRecipientRef[]
) {
	const firstKeys = firstRefs.map(getFormatRecipientKey);
	const secondKeys = secondRefs.map(getFormatRecipientKey);

	return JSON.stringify(firstKeys) === JSON.stringify(secondKeys);
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
	let contentEditor = $state<BuilderEditorState | null>(null);
	let savedContent = $state<BuilderEmailContent | null>(null);
	let contentDirty = $state(false);
	let emailDraftVersion = $state(0);
	let rulesDraft = $state<EmailFormatRule[]>([]);
	let savedRules = $state<EmailFormatRule[]>([]);
	let selectedRecipientRefs = $state<EmailFormatRecipientRef[]>([]);
	let savedRecipientRefs = $state<EmailFormatRecipientRef[]>([]);
	let selectedSentEmailIndex = $state(0);
	let feedbackDraftsBySentEmailId = $state<Record<string, EmailFeedback>>({});
	let savedFeedbackBySentEmailId = $state<Record<string, EmailFeedback>>({});

	function hasRuleChanges() {
		return !areRulesEqual(rulesDraft, savedRules);
	}

	function canSaveRules() {
		return hasRuleChanges() && areEmailFormatRulesFilled(rulesDraft);
	}

	function hasRecipientChanges() {
		return !areRecipientRefsEqual(selectedRecipientRefs, savedRecipientRefs);
	}

	function createContentEditor(content: BuilderEmailContent) {
		return new BuilderEditorState(content, { onContentChange: markContentChanged });
	}

	function replaceEditorContent(nextContent: BuilderEmailContent) {
		if (contentEditor) {
			contentEditor.setContentChangeHandler(markContentChanged);
			contentEditor.replaceEmailContent(nextContent, { resetDirty: true });
		} else {
			contentEditor = createContentEditor(nextContent);
		}
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
			const nextContent = cloneBuilderEmailContent(detail.emailFormat.content);
			replaceEditorContent(nextContent);
			savedContent = cloneBuilderEmailContent(nextContent);
			contentDirty = false;
			emailDraftVersion = detail.emailFormat.emailDraftVersion;
			syncedEmailDraftVersion = detail.emailFormat.emailDraftVersion;
		}

		if (detail.emailFormat.updatedAt > syncedRulesUpdatedAt && !hasRuleChanges()) {
			rulesDraft = cloneRules(detail.emailFormat.rules);
			savedRules = cloneRules(detail.emailFormat.rules);
			syncedRulesUpdatedAt = detail.emailFormat.updatedAt;
		}

		if (
			syncRecipients &&
			detail.emailFormat.updatedAt > syncedRecipientsUpdatedAt &&
			!hasRecipientChanges()
		) {
			selectedRecipientRefs = cloneRecipientRefs(detail.emailFormat.recipientRefs);
			savedRecipientRefs = cloneRecipientRefs(detail.emailFormat.recipientRefs);
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

	function markContentSaved(nextContent: BuilderEmailContent, nextEmailDraftVersion: number) {
		const normalizedContent = cloneBuilderEmailContent(nextContent);
		replaceEditorContent(normalizedContent);
		savedContent = cloneBuilderEmailContent(normalizedContent);
		contentDirty = false;
		emailDraftVersion = nextEmailDraftVersion;
		syncedEmailDraftVersion = nextEmailDraftVersion;
	}

	function replaceContentDraft(nextContent: BuilderEmailContent) {
		replaceEditorContent(nextContent);
	}

	function markContentChanged() {
		contentDirty = true;
	}

	function updateContentTitle(nextTitle: string) {
		contentEditor?.updateTitle(nextTitle, { notify: false });
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
		selectedRecipientRefs = cloneRecipientRefs(nextRefs);
	}

	function markRecipientsSaved(nextRefs: EmailFormatRecipientRef[], updatedAt: number) {
		selectedRecipientRefs = cloneRecipientRefs(nextRefs);
		savedRecipientRefs = cloneRecipientRefs(nextRefs);
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
		get contentEditor() {
			return contentEditor;
		},
		get emailDraftVersion() {
			return emailDraftVersion;
		},
		get emailContent() {
			return contentEditor?.activeEmailContent ?? null;
		},
		get savedContent() {
			return savedContent;
		},
		get contentDirty() {
			return contentEditor?.contentDirty ?? contentDirty;
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
		markContentSaved,
		markContentChanged,
		markFeedbackSaved,
		markRulesSaved,
		markRecipientsSaved,
		replaceContentDraft,
		sync,
		updateContentTitle,
		updateFeedback,
		updateRules,
		updateSelectedRecipientRefs
	};
}

export type EmailFormatDetailState = ReturnType<typeof createEmailFormatDetailState>;
