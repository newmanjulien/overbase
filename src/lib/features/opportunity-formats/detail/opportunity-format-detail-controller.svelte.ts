import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { api } from '$convex/_generated/api';
import type { Id } from '$convex/_generated/dataModel';
import type { EmailDraft } from '@overbase/builder-sdk/email';
import { useConvexClient } from 'convex-svelte';
import { APP_LINKS } from '$lib/app/app-links';
import {
	areOpportunityFormatRulesFilled,
	type OpportunityFormatDetailState
} from './opportunity-format-detail-state.svelte';
import type {
	FormatRecipientRef,
	OpportunityFeedback,
	OpportunityFeedbackViewState
} from './opportunity-format-detail-types';
import { getFormatRecipientKey } from './opportunity-format-detail-types';

type OpportunityFormatStatus = 'active' | 'paused';

type ControllerOptions = {
	detailState: OpportunityFormatDetailState;
	getFeedbackViewState: () => OpportunityFeedbackViewState;
	getOpportunityFormatId: () => Id<'opportunityFormats'>;
	onTitleSaved: (title: string) => void;
};

function areRecipientRefsEqual(firstValues: FormatRecipientRef[], secondValues: FormatRecipientRef[]) {
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

export function createOpportunityFormatDetailController({
	detailState,
	getFeedbackViewState,
	getOpportunityFormatId,
	onTitleSaved
}: ControllerOptions) {
	const client = useConvexClient();
	let status = $state<OpportunityFormatStatus>('paused');
	let isDeletingFormat = $state(false);
	let isUpdatingStatus = $state(false);
	let isSavingRecipients = $state(false);
	let hasPendingRecipientsSave = $state(false);
	let deleteError = $state<string | null>(null);
	let actionError = $state<string | null>(null);

	function syncStatus(nextStatus: OpportunityFormatStatus) {
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
			const result = await client.mutation(api.opportunityFormats.setOpportunityFormatStatus, {
				opportunityFormatId: getOpportunityFormatId(),
				status: nextStatus
			});
			status = result.status;
		} catch (error) {
			status = previousStatus;
			actionError = getErrorMessage(error, 'Could not update format status.');
		} finally {
			isUpdatingStatus = false;
		}
	}

	async function updateSelectedRecipientRefs(nextRefs: FormatRecipientRef[]) {
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

				const result = await client.mutation(api.opportunityFormats.setOpportunityFormatRecipients, {
					opportunityFormatId: getOpportunityFormatId(),
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
		const result = await client.mutation(api.opportunityFormats.saveOpportunityFormatEmailDraft, {
			opportunityFormatId: getOpportunityFormatId(),
			baseEmailDraftVersion,
			draft: nextDraft
		});

		detailState.markEmailDraftSaved(result.emailDraft, result.emailDraftVersion);
	}

	async function saveTitle(title: string) {
		actionError = null;

		try {
			const result = await client.mutation(api.opportunityFormats.updateOpportunityFormatTitle, {
				opportunityFormatId: getOpportunityFormatId(),
				title
			});
			onTitleSaved(result.title);
		} catch (error) {
			actionError = getErrorMessage(error, 'Could not update format title.');
			throw error;
		}
	}

	async function saveRules() {
		actionError = null;

		if (!areOpportunityFormatRulesFilled(detailState.rulesDraft)) {
			actionError = 'Add rule text before saving.';
			return;
		}

		try {
			const result = await client.mutation(api.opportunityFormats.saveOpportunityFormatRules, {
				opportunityFormatId: getOpportunityFormatId(),
				rules: detailState.rulesDraft
			});
			detailState.markRulesSaved(result.rules, result.updatedAt);
			status = result.status;
		} catch (error) {
			actionError = getErrorMessage(error, 'Could not save rules.');
		}
	}

	function updateSelectedFeedback(patch: Partial<OpportunityFeedback>) {
		const feedbackViewState = getFeedbackViewState();

		if (feedbackViewState.kind === 'empty') {
			return;
		}

		detailState.updateFeedback(feedbackViewState.opportunity.id, patch);
	}

	async function saveSelectedFeedback() {
		const feedbackViewState = getFeedbackViewState();

		if (feedbackViewState.kind === 'empty') {
			return;
		}

		actionError = null;

		try {
			const result = await client.mutation(api.opportunityFormats.saveOpportunityFeedback, {
				opportunityId: feedbackViewState.opportunity.id as Id<'opportunities'>,
				likedText: feedbackViewState.feedbackDraft.likedText,
				improvementText: feedbackViewState.feedbackDraft.improvementText
			});
			detailState.markFeedbackSaved(feedbackViewState.opportunity.id, result);
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
			await client.mutation(api.opportunityFormats.deleteOpportunityFormats, {
				opportunityFormatIds: [getOpportunityFormatId()]
			});
			await goto(resolve(APP_LINKS.formats.pathname));
		} catch (error) {
			deleteError = getErrorMessage(error, 'Could not delete format.');
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
