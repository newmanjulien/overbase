<script lang="ts">
	import { api } from '$convex/_generated/api';
	import type { Id } from '$convex/_generated/dataModel';
	import { useQuery } from 'convex-svelte';
	import { useRouteTitleState } from '$lib/app/chrome/shared/route-title.svelte';
	import EmailFormatDetailDesktop from './EmailFormatDetailDesktop.svelte';
	import EmailFormatDetailMobile from './EmailFormatDetailMobile.svelte';
	import EmailFormatDetailRouteActions from './EmailFormatDetailRouteActions.svelte';
	import { createEmailFormatDetailController } from './email-format-detail-controller.svelte';
	import { createEmailFormatDetailState } from './email-format-detail-state.svelte';
	import type {
		EmailFeedbackViewState,
		EmailFormatDetailLoadState,
		EmailFormatDetailView
	} from './email-format-detail-types';

	type Props = {
		emailFormatId: Id<'emailFormats'>;
	};

	let { emailFormatId }: Props = $props();
	const routeTitleState = useRouteTitleState();
	const detailState = createEmailFormatDetailState();
	const controller = createEmailFormatDetailController({
		detailState,
		getFeedbackViewState,
		getEmailFormatId: () => emailFormatId,
		onTitleSaved: (title) => {
			routeTitleState.title = title;
		}
	});
	const detailQuery = useQuery(api.emailFormats.getEmailFormatDetail, () => ({
		emailFormatId
	}));
	const detail = $derived(detailQuery.data);
	const emailFormat = $derived(detail?.emailFormat ?? null);
	const sentEmails = $derived(detail?.sentEmails ?? []);
	const people = $derived(detail?.people ?? []);
	let detailView = $state<EmailFormatDetailView>('rules');
	let isMobileAttachmentOpen = $state(false);
	const detailViewActionLabel = $derived(
		detailView === 'rules' ? 'Give feedback on sent emails' : 'Set rules'
	);
	const canToggleStatus = $derived(
		Boolean(emailFormat) &&
			!controller.isUpdatingStatus &&
			controller.status === 'active'
	);
	const feedbackViewState = $derived(getFeedbackViewState());
	const loadState = $derived(getLoadState());
	const routeOverflowActions = $derived([
		{
			label: controller.isDeletingFormat ? 'Deleting...' : 'Delete',
			ariaLabel: 'Delete',
			intent: 'destructive' as const,
			disabled: controller.isDeletingFormat,
			onSelect: controller.deleteFormat
		}
	]);

	function getLoadState(): EmailFormatDetailLoadState {
		if (detailQuery.isLoading) {
			return 'loading';
		}

		if (detailQuery.error) {
			return 'error';
		}

		return detail ? 'ready' : 'notFound';
	}

	function getFeedbackViewState(): EmailFeedbackViewState {
		const selectedSentEmail = sentEmails[detailState.selectedSentEmailIndex] ?? sentEmails[0];

		if (!selectedSentEmail) {
			return { kind: 'empty' };
		}

		const feedbackDraft = detailState.getFeedbackDraft(selectedSentEmail.id);
		return {
			kind: 'selected',
			sentEmail: selectedSentEmail,
			feedbackDraft,
			canGoPrevious: detailState.selectedSentEmailIndex > 0,
			canGoNext: detailState.selectedSentEmailIndex < sentEmails.length - 1,
			canSave: detailState.canSaveFeedback(selectedSentEmail.id)
		};
	}

	function toggleDetailView() {
		detailView = detailView === 'rules' ? 'feedback' : 'rules';
	}

	function showMobileAttachment() {
		isMobileAttachmentOpen = true;
	}

	function closeMobileAttachment() {
		isMobileAttachmentOpen = false;
	}

	function showFeedbackView() {
		detailView = 'feedback';
	}

	function showPreviousSentEmail() {
		if (feedbackViewState.kind === 'empty' || !feedbackViewState.canGoPrevious) {
			return;
		}

		detailState.selectedSentEmailIndex -= 1;
	}

	function showNextSentEmail() {
		if (feedbackViewState.kind === 'empty' || !feedbackViewState.canGoNext) {
			return;
		}

		detailState.selectedSentEmailIndex += 1;
	}

	$effect(() => {
		routeTitleState.onTitleChange = controller.saveTitle;
		routeTitleState.actions = routeActions;
		routeTitleState.overflowActions = routeOverflowActions;

		return () => {
			if (routeTitleState.onTitleChange === controller.saveTitle) {
				routeTitleState.onTitleChange = null;
			}

			if (routeTitleState.actions === routeActions) {
				routeTitleState.actions = null;
			}

			if (routeTitleState.overflowActions === routeOverflowActions) {
				routeTitleState.overflowActions = [];
			}
		};
	});

	$effect(() => {
		if (!detail) {
			return;
		}

		routeTitleState.title = detail.emailFormat.title;
		controller.syncStatus(detail.emailFormat.status);
		detailState.sync(emailFormatId, detail, {
			syncRecipients: !controller.isSavingRecipients
		});
	});
</script>

{#snippet routeActions()}
	<EmailFormatDetailRouteActions
		{canToggleStatus}
		{detailViewActionLabel}
		{people}
		selectedRecipientRefs={detailState.selectedRecipientRefs}
		status={controller.status}
		onSelectedRecipientRefsChange={controller.updateSelectedRecipientRefs}
		onToggleDetailView={toggleDetailView}
		onToggleStatus={() => controller.toggleStatus(canToggleStatus)}
	/>
{/snippet}

<EmailFormatDetailDesktop
	actionError={controller.actionError}
	deleteError={controller.deleteError}
	{detailState}
	{detailView}
	{feedbackViewState}
	{loadState}
	onFeedbackChange={controller.updateSelectedFeedback}
	onSaveDraft={controller.saveDraft}
	onSaveFeedback={controller.saveSelectedFeedback}
	onSaveRules={controller.saveRules}
	onShowFeedbackView={showFeedbackView}
	onShowNextSentEmail={showNextSentEmail}
	onShowPreviousSentEmail={showPreviousSentEmail}
/>

<EmailFormatDetailMobile
	{detailState}
	isAttachmentOpen={isMobileAttachmentOpen}
	{loadState}
	onCloseAttachment={closeMobileAttachment}
	onOpenAttachment={showMobileAttachment}
	onSaveRules={controller.saveRules}
/>
