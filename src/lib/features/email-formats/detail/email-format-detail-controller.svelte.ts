import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { api } from '$convex/_generated/api';
import type { Id } from '$convex/_generated/dataModel';
import type { EmailDraft } from '$shared/email-drafts';
import { useConvexClient } from 'convex-svelte';
import { APP_LINKS } from '$lib/app/app-links';
import {
	areEmailFormatRulesFilled,
	type EmailFormatDetailState
} from './email-format-detail-state.svelte';
import type {
	EmailFormatRecipientRef,
	EmailFeedback,
	EmailFeedbackViewState
} from './email-format-detail-types';
import { getFormatRecipientKey } from './email-format-detail-types';

type EmailFormatStatus = 'active' | 'paused';

type ControllerOptions = {
	detailState: EmailFormatDetailState;
	getFeedbackViewState: () => EmailFeedbackViewState;
	getEmailFormatId: () => Id<'emailFormats'>;
	onTitleSaved: (title: string) => void;
};

function areRecipientRefsEqual(firstValues: EmailFormatRecipientRef[], secondValues: EmailFormatRecipientRef[]) {
	return (
		firstValues.length === secondValues.length &&
		firstValues.every(
			(value, index) => getFormatRecipientKey(value) === getFormatRecipientKey(secondValues[index])
		)
	);
}

function getErrorMessage(error: unknown, fallback: string) {
	return error instanceof Error ? error.message : fallback;
}

export function createEmailFormatDetailController({
	detailState,
	getFeedbackViewState,
	getEmailFormatId,
	onTitleSaved
}: ControllerOptions) {
	const client = useConvexClient();
	let status = $state<EmailFormatStatus>('paused');
	let isDeletingFormat = $state(false);
	let isUpdatingStatus = $state(false);
	let isSavingRecipients = $state(false);
	let hasPendingRecipientsSave = $state(false);
	let deleteError = $state<string | null>(null);
	let actionError = $state<string | null>(null);

	function syncStatus(nextStatus: EmailFormatStatus) {
		status = nextStatus;
	}

	async function toggleStatus(canToggleStatus: boolean) {
		if (!canToggleStatus) {
			return;
		}

		const previousStatus = status;
		const nextStatus = status === 'active' ? 'paused' : 'active';
		status = nextStatus;
		actionError = null;
		isUpdatingStatus = true;

		try {
			const result = await client.mutation(api.emailFormats.setEmailFormatStatus, {
				emailFormatId: getEmailFormatId(),
				status: nextStatus
			});
			status = result.status;
		} catch (error) {
			status = previousStatus;
			actionError = getErrorMessage(error, 'Could not update email format status.');
		} finally {
			isUpdatingStatus = false;
		}
	}

	async function updateSelectedRecipientRefs(nextRefs: EmailFormatRecipientRef[]) {
		detailState.updateSelectedRecipientRefs(nextRefs);
		actionError = null;
		hasPendingRecipientsSave = true;
		await flushRecipientsSave();
	}

	async function flushRecipientsSave() {
		if (isSavingRecipients) {
			return;
		}

		isSavingRecipients = true;

		try {
			while (hasPendingRecipientsSave) {
				hasPendingRecipientsSave = false;
				const requestedRecipientRefs = [...detailState.selectedRecipientRefs];

				const result = await client.mutation(api.emailFormats.setEmailFormatRecipients, {
					emailFormatId: getEmailFormatId(),
					recipientRefs: requestedRecipientRefs
				});

				if (areRecipientRefsEqual(detailState.selectedRecipientRefs, requestedRecipientRefs)) {
					detailState.markRecipientsSaved(result.recipientRefs, result.updatedAt);
				}
			}
		} catch (error) {
			actionError = getErrorMessage(error, 'Could not update recipients.');
		} finally {
			isSavingRecipients = false;
		}
	}

	async function saveDraft(nextDraft: EmailDraft, baseEmailDraftVersion: number) {
		const result = await client.mutation(api.emailFormats.saveEmailFormatEmailDraft, {
			emailFormatId: getEmailFormatId(),
			baseEmailDraftVersion,
			draft: nextDraft
		});

		detailState.markEmailDraftSaved(result.emailDraft, result.emailDraftVersion);
	}

	async function saveTitle(title: string) {
		actionError = null;

		try {
			const result = await client.mutation(api.emailFormats.updateEmailFormatTitle, {
				emailFormatId: getEmailFormatId(),
				title
			});
			onTitleSaved(result.title);
		} catch (error) {
			actionError = getErrorMessage(error, 'Could not update email format title.');
			throw error;
		}
	}

	async function saveRules() {
		actionError = null;

		if (!areEmailFormatRulesFilled(detailState.rulesDraft)) {
			actionError = 'Add rule text before saving.';
			return;
		}

		try {
			const result = await client.mutation(api.emailFormats.saveEmailFormatRules, {
				emailFormatId: getEmailFormatId(),
				rules: detailState.rulesDraft
			});
			detailState.markRulesSaved(result.rules, result.updatedAt);
			status = result.status;
		} catch (error) {
			actionError = getErrorMessage(error, 'Could not save rules.');
		}
	}

	function updateSelectedFeedback(patch: Partial<EmailFeedback>) {
		const feedbackViewState = getFeedbackViewState();

		if (feedbackViewState.kind === 'empty') {
			return;
		}

		detailState.updateFeedback(feedbackViewState.sentEmail.id, patch);
	}

	async function saveSelectedFeedback() {
		const feedbackViewState = getFeedbackViewState();

		if (feedbackViewState.kind === 'empty') {
			return;
		}

		actionError = null;

		try {
			const result = await client.mutation(api.emailFormats.saveEmailFeedback, {
				sentEmailId: feedbackViewState.sentEmail.id as Id<'sentEmails'>,
				likedText: feedbackViewState.feedbackDraft.likedText,
				improvementText: feedbackViewState.feedbackDraft.improvementText
			});
			detailState.markFeedbackSaved(feedbackViewState.sentEmail.id, result);
		} catch (error) {
			actionError = getErrorMessage(error, 'Could not save feedback.');
		}
	}

	async function deleteFormat() {
		if (isDeletingFormat) {
			return;
		}

		deleteError = null;
		isDeletingFormat = true;

		try {
			await client.mutation(api.emailFormats.deleteEmailFormats, {
				emailFormatIds: [getEmailFormatId()]
			});
			await goto(resolve(APP_LINKS.emailFormats.pathname));
		} catch (error) {
			deleteError = getErrorMessage(error, 'Could not delete email format.');
		} finally {
			isDeletingFormat = false;
		}
	}

	return {
		get actionError() {
			return actionError;
		},
		get deleteError() {
			return deleteError;
		},
		get isDeletingFormat() {
			return isDeletingFormat;
		},
		get isSavingRecipients() {
			return isSavingRecipients;
		},
		get isUpdatingStatus() {
			return isUpdatingStatus;
		},
		get status() {
			return status;
		},
		deleteFormat,
		saveDraft,
		saveRules,
		saveSelectedFeedback,
		saveTitle,
		syncStatus,
		toggleStatus,
		updateSelectedFeedback,
		updateSelectedRecipientRefs
	};
}
