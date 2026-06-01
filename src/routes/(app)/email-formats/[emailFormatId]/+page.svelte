<script lang="ts">
	import { api } from '$convex/_generated/api';
	import type { Id } from '$convex/_generated/dataModel';
	import { useRouteTitleState } from '$lib/app/chrome/shared/route-title.svelte';
	import { getFormatStarter } from '$lib/features/format-starters/catalog';
	import { FormatVariableDragCoordinator } from '$lib/features/format-starters/creator/variables/format-variable-drag-coordinator.svelte';
	import EmailFormatDetailDesktop from '$lib/features/email-formats/detail/EmailFormatDetailDesktop.svelte';
	import EmailFormatHeaderActions from '$lib/features/email-formats/detail/EmailFormatHeaderActions.svelte';
	import EmailFormatDetailMobile from '$lib/features/email-formats/detail/EmailFormatDetailMobile.svelte';
	import {
		createEmailFormatDetailState,
		type EmailFormatDetailState
	} from '$lib/features/email-formats/detail/email-format-detail-state.svelte';
	import type {
		EmailFeedback,
		EmailFeedbackViewState,
		EmailFormatContent,
		EmailFormatDetailLoadState,
		EmailFormatDetailView,
		SentEmail
	} from '$lib/features/email-formats/detail/email-format-detail-types';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { onDestroy, untrack } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const client = useConvexClient();
	const routeTitleState = useRouteTitleState();
	const emailFormatId = $derived(data.emailFormatId as Id<'emailFormats'>);
	const detailState: EmailFormatDetailState = createEmailFormatDetailState();
	const dragCoordinator = new FormatVariableDragCoordinator();
	const detailQuery = useQuery(api.emailFormats.getEmailFormatDetail, () => ({ emailFormatId }));
	let detailView = $state<EmailFormatDetailView>('rules');
	let actionError = $state<string | null>(null);
	let contentError = $state<string | null>(null);
	let isSavingRecipients = $state(false);
	let isUpdatingStatus = $state(false);

	const loadState = $derived.by<EmailFormatDetailLoadState>(() => {
		if (detailQuery.isLoading) {
			return 'loading';
		}

		if (detailQuery.error) {
			return 'error';
		}

		return detailQuery.data ? 'ready' : 'notFound';
	});
	const recipientPickerPeople = $derived(detailQuery.data?.recipientPickerPeople ?? []);
	const emailFormatStatus = $derived(detailQuery.data?.emailFormat.status ?? null);
	const contentVariables = $derived(
		detailQuery.data
			? (getFormatStarter(detailQuery.data.emailFormat.formatStarterSlug)?.variables ?? [])
			: []
	);
	const sentEmails = $derived((detailQuery.data?.sentEmails ?? []) as SentEmail[]);
	const feedbackViewState = $derived.by<EmailFeedbackViewState>(() => {
		const sentEmail = sentEmails[detailState.selectedSentEmailIndex];

		if (!sentEmail) {
			return { kind: 'empty' };
		}

		return {
			kind: 'selected',
			sentEmail,
			feedbackDraft: detailState.getFeedbackDraft(sentEmail.id),
			canGoPrevious: detailState.selectedSentEmailIndex > 0,
			canGoNext: detailState.selectedSentEmailIndex < sentEmails.length - 1,
			canSave: detailState.canSaveFeedback(sentEmail.id)
		};
	});

	$effect(() => {
		const detail = detailQuery.data;
		const currentEmailFormatId = emailFormatId;

		if (detail) {
			untrack(() => {
				detailState.sync(currentEmailFormatId, detail);
				routeTitleState.title = detailState.titleDraft;
			});
		}
	});

	$effect(() => {
		const saveTitle = async (nextTitle: string) => {
			detailState.updateTitleDraft(nextTitle);

			if (!detailQuery.data) {
				return;
			}

			await saveTitleDraft({
				rethrow: true
			});
		};

		routeTitleState.onTitleChange = saveTitle;
		routeTitleState.actions = headerActions;

		return () => {
			if (routeTitleState.onTitleChange === saveTitle) {
				routeTitleState.onTitleChange = null;
			}
			if (routeTitleState.actions === headerActions) {
				routeTitleState.actions = null;
			}
		};
	});

	onDestroy(() => {
		dragCoordinator.endDrag();
	});

	function getContentSaveError(error: unknown) {
		return error instanceof Error ? error.message : 'Could not save email format.';
	}

	function toEmailContentInput(content: EmailFormatContent) {
		return {
			to: [...content.to],
			cc: [...content.cc],
			attachment: content.attachment
				? {
						filename: content.attachment.filename,
						cellsByKey: Object.fromEntries(
							Object.entries(content.attachment.cellsByKey).map(([key, cell]) => [
								key,
								cell.map((node) => ({ ...node }))
							])
						)
					}
				: null,
			body: content.body.map((block) => ({
				id: block.id,
				type: block.type,
				content: block.content.map((node) => ({ ...node }))
			}))
		};
	}

	async function saveTitleDraft({
		rethrow = false,
		overwriteConflict = false
	}: { rethrow?: boolean; overwriteConflict?: boolean } = {}) {
		if (!detailQuery.data || detailState.isSavingTitle) {
			return;
		}

		actionError = null;
		detailState.isSavingTitle = true;

		try {
			const result = await client.mutation(api.emailFormats.updateEmailFormatTitle, {
				emailFormatId,
				baseTitleVersion: detailState.getTitleSaveVersion({ overwriteConflict }),
				title: detailState.titleDraft
			});

			if (result.kind === 'stale') {
				detailState.syncTitleRemote(result.title);
				routeTitleState.title = detailState.titleDraft;
				return;
			}

			detailState.markTitleSaved(result.title);
			routeTitleState.title = result.title.value;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Could not save title.';
			actionError = message;
			if (detailQuery.data) {
				detailState.sync(emailFormatId, detailQuery.data);
			}

			if (rethrow && !detailState.titleConflict) {
				throw error;
			}
		} finally {
			detailState.isSavingTitle = false;
		}
	}

	async function saveContent({
		rethrow = false,
		overwriteConflict = false
	}: { rethrow?: boolean; overwriteConflict?: boolean } = {}) {
		if (!detailQuery.data) {
			return;
		}

		const contentDraft = detailState.emailContentDraft;

		if (!contentDraft) {
			return;
		}

		if (detailState.isSavingContent) {
			const error = new Error('Email format is already saving.');
			contentError = error.message;
			actionError = error.message;

			if (rethrow) {
				throw error;
			}
			return;
		}

		actionError = null;
		contentError = null;
		detailState.isSavingContent = true;

		try {
			const contentInput = toEmailContentInput(contentDraft);
			const result = await client.mutation(api.emailFormats.updateEmailFormatContent, {
				emailFormatId,
				baseEmailContentVersion: detailState.getContentSaveVersion({ overwriteConflict }),
				...contentInput
			});

			if (result.kind === 'stale') {
				detailState.syncContentRemote(result.emailContent);
				return;
			}

			detailState.markContentSaved(result.emailContent);
		} catch (error) {
			const message = getContentSaveError(error);
			contentError = message;
			actionError = message;
			if (detailQuery.data) {
				detailState.sync(emailFormatId, detailQuery.data);
			}

			if (rethrow) {
				throw error;
			}
		} finally {
			detailState.isSavingContent = false;
		}
	}

	async function saveRules({ overwriteConflict = false } = {}) {
		if (detailState.isSavingRules) {
			return;
		}

		actionError = null;
		detailState.isSavingRules = true;

		try {
			const result = await client.mutation(api.emailFormats.updateEmailFormatRules, {
				emailFormatId,
				baseRulesVersion: detailState.getRulesSaveVersion({ overwriteConflict }),
				rules: detailState.rulesDraft
			});

			if (result.kind === 'stale') {
				detailState.syncRulesRemote(result.rules);
				return;
			}

			detailState.markRulesSaved(result.rules);
		} catch (error) {
			actionError = error instanceof Error ? error.message : 'Could not save rules.';
			if (detailQuery.data) {
				detailState.sync(emailFormatId, detailQuery.data);
			}
		} finally {
			detailState.isSavingRules = false;
		}
	}

	async function saveRecipients(nextRefs = detailState.selectedRecipientRefs) {
		if (isSavingRecipients) {
			return;
		}

		const previousRefs = detailState.selectedRecipientRefs;
		actionError = null;
		detailState.updateSelectedRecipientRefs(nextRefs);
		isSavingRecipients = true;

		try {
			const result = await client.mutation(api.emailFormats.updateEmailFormatRecipients, {
				emailFormatId,
				recipientRefs: nextRefs
			});
			detailState.markRecipientsSaved(result.recipientRefs, result.updatedAt);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Could not save recipients.';
			actionError = message;
			detailState.updateSelectedRecipientRefs(previousRefs);
		} finally {
			isSavingRecipients = false;
		}
	}

	async function toggleStatus() {
		if (!emailFormatStatus || isUpdatingStatus) {
			return;
		}

		const nextStatus = emailFormatStatus === 'active' ? 'paused' : 'active';

		actionError = null;
		isUpdatingStatus = true;

		try {
			await client.mutation(api.emailFormats.setEmailFormatStatus, {
				emailFormatId,
				status: nextStatus
			});
		} catch (error) {
			actionError =
				error instanceof Error
					? error.message
					: `Could not ${nextStatus === 'active' ? 'activate' : 'pause'} email format.`;
		} finally {
			isUpdatingStatus = false;
		}
	}

	function updateFeedback(patch: Partial<EmailFeedback>) {
		if (feedbackViewState.kind === 'selected') {
			detailState.updateFeedback(feedbackViewState.sentEmail.id, patch);
		}
	}

	function saveFeedback() {
		if (feedbackViewState.kind === 'selected') {
			detailState.markFeedbackSaved(
				feedbackViewState.sentEmail.id,
				feedbackViewState.feedbackDraft
			);
		}
	}

	function showFeedbackView() {
		detailView = 'feedback';
	}

	function showPreviousSentEmail() {
		detailState.selectedSentEmailIndex = Math.max(0, detailState.selectedSentEmailIndex - 1);
	}

	function showNextSentEmail() {
		detailState.selectedSentEmailIndex = Math.min(
			sentEmails.length - 1,
			detailState.selectedSentEmailIndex + 1
		);
	}

	function keepMineTitle() {
		return saveTitleDraft({ overwriteConflict: true });
	}

	function useLatestTitle() {
		detailState.useLatestTitle();
		routeTitleState.title = detailState.titleDraft;
		actionError = null;
	}

	function keepMineContent() {
		return saveContent({ overwriteConflict: true });
	}

	function useLatestContent() {
		detailState.useLatestContent();
		contentError = null;
		actionError = null;
	}

	function keepMineRules() {
		return saveRules({ overwriteConflict: true });
	}

	function useLatestRules() {
		detailState.useLatestRules();
		actionError = null;
	}
</script>

{#snippet headerActions()}
	<EmailFormatHeaderActions
		status={emailFormatStatus}
		people={recipientPickerPeople}
		selectedRecipientRefs={detailState.selectedRecipientRefs}
		{isSavingRecipients}
		{isUpdatingStatus}
		onSelectedRecipientRefsChange={saveRecipients}
		onToggleStatus={toggleStatus}
	/>
{/snippet}

<EmailFormatDetailDesktop
	{actionError}
	deleteError={null}
	{detailState}
	{detailView}
	{feedbackViewState}
	canShowFeedbackView={sentEmails.length > 0}
	{contentError}
	{contentVariables}
	{dragCoordinator}
	{loadState}
	onFeedbackChange={updateFeedback}
	onKeepMineContent={keepMineContent}
	onKeepMineRules={keepMineRules}
	onKeepMineTitle={keepMineTitle}
	onSaveContent={saveContent}
	onSaveFeedback={saveFeedback}
	onSaveRules={saveRules}
	onShowFeedbackView={showFeedbackView}
	onShowNextSentEmail={showNextSentEmail}
	onShowPreviousSentEmail={showPreviousSentEmail}
	onUseLatestContent={useLatestContent}
	onUseLatestRules={useLatestRules}
	onUseLatestTitle={useLatestTitle}
/>

<EmailFormatDetailMobile
	{actionError}
	{contentError}
	{contentVariables}
	{detailState}
	{dragCoordinator}
	{loadState}
	onKeepMineContent={keepMineContent}
	onKeepMineRules={keepMineRules}
	onKeepMineTitle={keepMineTitle}
	onSaveContent={saveContent}
	onSaveRules={saveRules}
	onUseLatestContent={useLatestContent}
	onUseLatestRules={useLatestRules}
	onUseLatestTitle={useLatestTitle}
/>
