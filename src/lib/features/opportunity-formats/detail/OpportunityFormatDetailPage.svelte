<script lang="ts">
	import { api } from '$convex/_generated/api';
	import type { Id } from '$convex/_generated/dataModel';
	import { useQuery } from 'convex-svelte';
	import { useRouteTitleState } from '$lib/components/chrome/shared/route-title.svelte';
	import OpportunityFormatDetailDesktop from './OpportunityFormatDetailDesktop.svelte';
	import OpportunityFormatDetailMobile from './OpportunityFormatDetailMobile.svelte';
	import OpportunityFormatDetailRouteActions from './OpportunityFormatDetailRouteActions.svelte';
	import { createOpportunityFormatDetailController } from './opportunity-format-detail-controller.svelte';
	import { createOpportunityFormatDetailState } from './opportunity-format-detail-state.svelte';
	import type {
		OpportunityFeedbackViewState,
		OpportunityFormatDetailLoadState,
		OpportunityFormatDetailView
	} from './opportunity-format-detail-types';

	type Props = {
		opportunityFormatId: Id<'opportunityFormats'>;
	};

	let { opportunityFormatId }: Props = $props();
	const routeTitleState = useRouteTitleState();
	const detailState = createOpportunityFormatDetailState();
	const controller = createOpportunityFormatDetailController({
		detailState,
		getFeedbackViewState,
		getOpportunityFormatId: () => opportunityFormatId,
		onTitleSaved: (title) => {
			routeTitleState.title = title;
		}
	});
	const detailQuery = useQuery(api.opportunityFormats.getOpportunityFormatDetail, () => ({
		opportunityFormatId
	}));
	const detail = $derived(detailQuery.data);
	const opportunityFormat = $derived(detail?.opportunityFormat ?? null);
	const opportunities = $derived(detail?.opportunities ?? []);
	const people = $derived(detail?.people ?? []);
	let detailView = $state<OpportunityFormatDetailView>('rules');
	let isMobileAttachmentOpen = $state(false);
	const detailViewActionLabel = $derived(
		detailView === 'rules' ? 'Give feedback on opportunities' : 'Set rules'
	);
	const canToggleStatus = $derived(
		Boolean(opportunityFormat) &&
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

	function getLoadState(): OpportunityFormatDetailLoadState {
		if (detailQuery.isLoading) {
			return 'loading';
		}

		if (detailQuery.error) {
			return 'error';
		}

		return detail ? 'ready' : 'notFound';
	}

	function getFeedbackViewState(): OpportunityFeedbackViewState {
		const selectedOpportunity = opportunities[detailState.selectedOpportunityIndex] ?? opportunities[0];

		if (!selectedOpportunity) {
			return { kind: 'empty' };
		}

		const feedbackDraft = detailState.getFeedbackDraft(selectedOpportunity.id);
		return {
			kind: 'selected',
			opportunity: selectedOpportunity,
			feedbackDraft,
			canGoPrevious: detailState.selectedOpportunityIndex > 0,
			canGoNext: detailState.selectedOpportunityIndex < opportunities.length - 1,
			canSave: detailState.canSaveFeedback(selectedOpportunity.id)
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

	function showPreviousOpportunity() {
		if (feedbackViewState.kind === 'empty' || !feedbackViewState.canGoPrevious) {
			return;
		}

		detailState.selectedOpportunityIndex -= 1;
	}

	function showNextOpportunity() {
		if (feedbackViewState.kind === 'empty' || !feedbackViewState.canGoNext) {
			return;
		}

		detailState.selectedOpportunityIndex += 1;
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

		routeTitleState.title = detail.opportunityFormat.title;
		controller.syncStatus(detail.opportunityFormat.status);
		detailState.sync(opportunityFormatId, detail, {
			syncRecipients: !controller.isSavingRecipients
		});
	});
</script>

{#snippet routeActions()}
	<OpportunityFormatDetailRouteActions
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

<OpportunityFormatDetailDesktop
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
	onShowNextOpportunity={showNextOpportunity}
	onShowPreviousOpportunity={showPreviousOpportunity}
/>

<OpportunityFormatDetailMobile
	{detailState}
	isAttachmentOpen={isMobileAttachmentOpen}
	{loadState}
	onCloseAttachment={closeMobileAttachment}
	onOpenAttachment={showMobileAttachment}
	onSaveRules={controller.saveRules}
/>
