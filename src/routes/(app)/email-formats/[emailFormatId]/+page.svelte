<script lang="ts">
	import { api } from '$convex/_generated/api';
	import type { Id } from '$convex/_generated/dataModel';
	import { useRouteTitleState } from '$lib/app/chrome/shared/route-title.svelte';
	import { getBuilder } from '$lib/features/builder/catalog';
	import {
		cloneBuilderEmailContent,
		type BuilderEmailContent
	} from '$lib/features/builder/domain';
	import { BuilderVariableDragCoordinator } from '$lib/features/builder/workbench/variables/builder-variable-drag-coordinator.svelte';
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
		EmailFormatDetailLoadState,
		EmailFormatDetailView,
		SentEmail
	} from '$lib/features/email-formats/detail/email-format-detail-types';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { onDestroy } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const client = useConvexClient();
	const routeTitleState = useRouteTitleState();
	const emailFormatId = $derived(data.emailFormatId as Id<'emailFormats'>);
	const detailState: EmailFormatDetailState = createEmailFormatDetailState();
	const dragCoordinator = new BuilderVariableDragCoordinator();
	const detailQuery = useQuery(api.emailFormats.getEmailFormatDetail, () => ({ emailFormatId }));
	let detailView = $state<EmailFormatDetailView>('rules');
	let actionError = $state<string | null>(null);
	let contentError = $state<string | null>(null);
	let isSavingContent = $state(false);
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
			? (getBuilder(detailQuery.data.emailFormat.builderSlug)?.variables ?? [])
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
		if (detailQuery.data) {
			detailState.sync(emailFormatId, detailQuery.data);
			routeTitleState.title =
				detailState.emailContent?.title ?? detailQuery.data.emailFormat.content.title;
		}
	});

	$effect(() => {
		const saveTitle = async (nextTitle: string) => {
			const currentContent = detailState.emailContent;

			if (!currentContent) {
				return;
			}

			const previousContent = cloneBuilderEmailContent(currentContent);
			detailState.updateContentTitle(nextTitle);

			try {
				await saveContent(detailState.emailContent, detailState.emailDraftVersion, {
					rethrow: true
				});
			} catch (error) {
				detailState.replaceContentDraft(previousContent);
				throw error;
			}
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

	async function saveContent(
		nextContent: BuilderEmailContent | null,
		baseEmailDraftVersion: number,
		{ rethrow = false } = {}
	) {
		if (!detailQuery.data) {
			return;
		}

		if (!nextContent) {
			return;
		}

		if (isSavingContent) {
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
		isSavingContent = true;

		try {
			const result = await client.mutation(api.emailFormats.updateEmailFormatContent, {
				emailFormatId,
				baseEmailDraftVersion,
				title: nextContent.title,
				to: [...nextContent.to],
				cc: [...nextContent.cc],
				attachment: nextContent.attachment
					? {
							filename: nextContent.attachment.filename,
							cellsByKey: Object.fromEntries(
								Object.entries(nextContent.attachment.cellsByKey).map(([key, cell]) => [
									key,
									cell.map((node) => ({ ...node }))
								])
							)
						}
					: null,
				body: nextContent.body.map((block) => ({
					id: block.id,
					type: block.type,
					content: block.content.map((node) => ({ ...node }))
				}))
			});

			detailState.markContentSaved(result.content, result.emailDraftVersion);
			routeTitleState.title = result.content.title;
		} catch (error) {
			const message = getContentSaveError(error);
			contentError = message;
			actionError = message;

			if (rethrow) {
				throw error;
			}
		} finally {
			isSavingContent = false;
		}
	}

	async function saveRules() {
		actionError = null;

		try {
			const result = await client.mutation(api.emailFormats.updateEmailFormatRules, {
				emailFormatId,
				rules: detailState.rulesDraft
			});
			detailState.markRulesSaved(result.rules, result.updatedAt);
		} catch (error) {
			actionError = error instanceof Error ? error.message : 'Could not save rules.';
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
	{isSavingContent}
	{loadState}
	onFeedbackChange={updateFeedback}
	onSaveContent={saveContent}
	onSaveFeedback={saveFeedback}
	onSaveRules={saveRules}
	onShowFeedbackView={showFeedbackView}
	onShowNextSentEmail={showNextSentEmail}
	onShowPreviousSentEmail={showPreviousSentEmail}
/>

<EmailFormatDetailMobile
	{actionError}
	{contentError}
	{contentVariables}
	{detailState}
	{dragCoordinator}
	{isSavingContent}
	{loadState}
	onSaveContent={saveContent}
	onSaveRules={saveRules}
/>
