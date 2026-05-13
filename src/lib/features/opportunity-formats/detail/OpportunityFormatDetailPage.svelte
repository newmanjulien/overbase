<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { api } from '$convex/_generated/api';
	import type { Id } from '$convex/_generated/dataModel';
	import { Pause, Play } from 'lucide-svelte';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { AvatarTeamPicker } from '$lib/components/people';
	import { Button } from '$lib/components/ui';
	import EmailDraftPanel from '$lib/components/email-draft/EmailDraftPanel.svelte';
	import EmailAttachmentSpreadsheetPreview from '$lib/components/email-draft/EmailAttachmentSpreadsheetPreview.svelte';
	import EmailComposePreview from '$lib/components/email-draft/EmailComposePreview.svelte';
	import SplitPane from '$lib/components/layout/split-pane/SplitPane.svelte';
	import { useRouteTitleState } from '$lib/components/chrome/shared/route-title.svelte';
	import OpportunityFeedbackEmptyState from './OpportunityFeedbackEmptyState.svelte';
	import OpportunityFeedbackPanel from './OpportunityFeedbackPanel.svelte';
	import OpportunityPreviewPanel from './OpportunityPreviewPanel.svelte';
	import OpportunityFormatRulesPanel from './OpportunityFormatRulesPanel.svelte';
	import {
		createOpportunityFormatDetailState,
		type OpportunityFeedback
	} from './opportunity-format-detail-state.svelte';
	import { OPPORTUNITY_FORMAT_DETAIL_SPLIT } from './opportunity-format-detail-layout';
	import { areOpportunityFormatRulesFilled } from './opportunity-format-detail-rules';
	import { type OpportunityItem } from './opportunity-format-detail-types';
	import type { EmailDraft } from '@overbase/builder-sdk/email';

	type DetailView = 'rules' | 'feedback';
	type FeedbackViewState =
		| { kind: 'empty' }
		| {
				kind: 'selected';
				opportunity: OpportunityItem;
				feedbackDraft: OpportunityFeedback;
				canGoPrevious: boolean;
				canGoNext: boolean;
				canSave: boolean;
		  };

	type Props = {
		opportunityFormatId: Id<'opportunityFormats'>;
	};

	let { opportunityFormatId }: Props = $props();
	const routeTitleState = useRouteTitleState();
	const client = useConvexClient();
	const detailState = createOpportunityFormatDetailState();
	const detailQuery = useQuery(api.opportunityFormats.getOpportunityFormatDetail, () => ({
		opportunityFormatId
	}));
	const detail = $derived(detailQuery.data);
	const opportunityFormat = $derived(detail?.opportunityFormat ?? null);
	const opportunities = $derived(detail?.opportunities ?? []);
	const people = $derived(detail?.people ?? []);
	const readiness = $derived(opportunityFormat?.readiness ?? null);
	let status = $state<'active' | 'paused'>('paused');
	let detailView = $state<DetailView>('rules');
	let isDeletingFormat = $state(false);
	let isUpdatingStatus = $state(false);
	let isSavingTeamMemberIds = $state(false);
	let hasPendingTeamMemberIdsSave = $state(false);
	let isMobileAttachmentOpen = $state(false);
	let deleteError = $state<string | null>(null);
	let actionError = $state<string | null>(null);
	const detailViewActionLabel = $derived(
		detailView === 'rules' ? 'Give feedback on opportunities' : 'Set rules'
	);
	const canToggleStatus = $derived(
		Boolean(opportunityFormat) &&
			!isUpdatingStatus &&
			(status === 'active' || (readiness?.canActivate ?? false))
	);
	const feedbackViewState = $derived(getFeedbackViewState());
	const routeOverflowActions = $derived([
		{
			label: isDeletingFormat ? 'Deleting...' : 'Delete',
			ariaLabel: 'Delete',
			intent: 'destructive' as const,
			disabled: isDeletingFormat,
			onSelect: deleteFormat
		}
	]);

	function getFeedbackViewState(): FeedbackViewState {
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

	function areStringArraysEqual(firstValues: string[], secondValues: string[]) {
		return (
			firstValues.length === secondValues.length &&
			firstValues.every((value, index) => value === secondValues[index])
		);
	}

	async function toggleStatus() {
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
				opportunityFormatId,
				status: nextStatus
			});
			status = result.status;
		} catch (error) {
			status = previousStatus;
			actionError = error instanceof Error ? error.message : 'Could not update format status.';
		} finally {
			isUpdatingStatus = false;
		}
	}

	async function updateSelectedTeamMemberIds(nextIds: string[]) {
		detailState.updateSelectedTeamMemberIds(nextIds);
		actionError = null;
		hasPendingTeamMemberIdsSave = true;
		await flushTeamMemberIdsSave();
	}

	async function flushTeamMemberIdsSave() {
		if (isSavingTeamMemberIds) {
			return;
		}

		isSavingTeamMemberIds = true;

		try {
			while (hasPendingTeamMemberIdsSave) {
				hasPendingTeamMemberIdsSave = false;
				const requestedTeamMemberIds = [...detailState.selectedTeamMemberIds];

				const result = await client.mutation(api.opportunityFormats.setOpportunityFormatTeamMembers, {
					opportunityFormatId,
					teamMemberIds: requestedTeamMemberIds
				});

				if (areStringArraysEqual(detailState.selectedTeamMemberIds, requestedTeamMemberIds)) {
					detailState.markTeamMembersSaved(result.teamMemberIds, result.updatedAt);
				}
			}
		} catch (error) {
			actionError = error instanceof Error ? error.message : 'Could not update team members.';
		} finally {
			isSavingTeamMemberIds = false;
		}
	}

	async function saveDraft(nextDraft: EmailDraft, baseEmailDraftVersion: number) {
		const result = await client.mutation(api.opportunityFormats.saveOpportunityFormatEmailDraft, {
			opportunityFormatId,
			baseEmailDraftVersion,
			draft: nextDraft
		});

		detailState.markEmailDraftSaved(result.emailDraft, result.emailDraftVersion);
	}

	async function saveTitle(title: string) {
		actionError = null;

		try {
			const result = await client.mutation(api.opportunityFormats.updateOpportunityFormatTitle, {
				opportunityFormatId,
				title
			});
			routeTitleState.title = result.title;
		} catch (error) {
			actionError = error instanceof Error ? error.message : 'Could not update format title.';
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
				opportunityFormatId,
				rules: detailState.rulesDraft
			});
			detailState.markRulesSaved(result.rules, result.updatedAt);
			status = result.status;
		} catch (error) {
			actionError = error instanceof Error ? error.message : 'Could not save rules.';
		}
	}

	function updateSelectedFeedback(patch: Partial<OpportunityFeedback>) {
		if (feedbackViewState.kind === 'empty') {
			return;
		}

		detailState.updateFeedback(feedbackViewState.opportunity.id, patch);
	}

	async function saveSelectedFeedback() {
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
			actionError = error instanceof Error ? error.message : 'Could not save feedback.';
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
				opportunityFormatIds: [opportunityFormatId]
			});
			await goto(resolve('/formats'));
		} catch (error) {
			deleteError = error instanceof Error ? error.message : 'Could not delete format.';
		} finally {
			isDeletingFormat = false;
		}
	}

	$effect(() => {
		routeTitleState.onTitleChange = saveTitle;
		routeTitleState.actions = routeActions;
		routeTitleState.overflowActions = routeOverflowActions;

		return () => {
			if (routeTitleState.onTitleChange === saveTitle) {
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
		status = detail.opportunityFormat.status;
		detailState.sync(opportunityFormatId, detail, {
			syncTeamMembers: !isSavingTeamMemberIds
		});
	});
</script>

{#snippet routeActions()}
	<div class="flex items-center gap-2">
		<Button
			variant="secondary"
			class="h-7 px-2.5 text-[0.68rem]"
			disabled={!canToggleStatus}
			onclick={() => void toggleStatus()}
		>
			{#snippet leading()}
				{#if status === 'active'}
					<Play class="size-3.5" />
				{:else}
					<Pause class="size-3.5" />
				{/if}
			{/snippet}
			{status === 'active' ? 'Active' : 'Paused'}
		</Button>
		<AvatarTeamPicker
			{people}
			selectedIds={detailState.selectedTeamMemberIds}
			minSelected={1}
			onSelectedIdsChange={(nextIds) => void updateSelectedTeamMemberIds(nextIds)}
			altBase="Format teammate"
			ariaLabel="Manage team members"
			searchPlaceholder="Search team..."
			emptyLabel="No team members found"
		/>
		<Button variant="secondary" class="h-7 px-2.5 text-[0.68rem]" onclick={toggleDetailView}>
			{detailViewActionLabel}
		</Button>
	</div>
{/snippet}

<div class="hidden h-full min-h-0 md:block">
	{#if deleteError || actionError}
		<p class="border-b border-red-100 bg-red-50 px-5 py-2 text-[0.72rem] text-red-700">
			{deleteError ?? actionError}
		</p>
	{/if}
	{#if detailQuery.isLoading}
		<div class="flex h-full items-center justify-center text-[0.74rem] text-zinc-500">
			Loading format...
		</div>
	{:else if detailQuery.error}
		<div class="flex h-full items-center justify-center text-[0.74rem] text-red-600">
			Could not load format.
		</div>
	{:else if !detail}
		<div class="flex h-full items-center justify-center text-[0.74rem] text-zinc-500">
			Format not found.
		</div>
	{:else if detailView === 'feedback' && feedbackViewState.kind === 'empty'}
		<OpportunityFeedbackEmptyState />
	{:else}
		<SplitPane
			minPrimary={OPPORTUNITY_FORMAT_DETAIL_SPLIT.minPrimary}
			minSecondary={OPPORTUNITY_FORMAT_DETAIL_SPLIT.minSecondary}
			defaultRatio={OPPORTUNITY_FORMAT_DETAIL_SPLIT.defaultRatio}
			mobileBreakpoint={OPPORTUNITY_FORMAT_DETAIL_SPLIT.mobileBreakpoint}
			keyboardStep={OPPORTUNITY_FORMAT_DETAIL_SPLIT.keyboardStep}
			handleWidth={OPPORTUNITY_FORMAT_DETAIL_SPLIT.handleWidth}
			label="Resize format detail panels"
		>
			{#snippet primary()}
				{#if detailView === 'rules'}
					<EmailDraftPanel
						draft={detailState.emailDraft}
						emailDraftVersion={detailState.emailDraftVersion}
						canEdit
						onSave={saveDraft}
					/>
				{:else if feedbackViewState.kind === 'selected'}
					<OpportunityPreviewPanel
						opportunity={feedbackViewState.opportunity}
						canGoPrevious={feedbackViewState.canGoPrevious}
						canGoNext={feedbackViewState.canGoNext}
						onPrevious={showPreviousOpportunity}
						onNext={showNextOpportunity}
					/>
				{/if}
			{/snippet}

			{#snippet secondary()}
				{#if detailView === 'rules'}
					<OpportunityFormatRulesPanel
						rules={detailState.rulesDraft}
						canSave={detailState.canSaveRules}
						onRulesChange={detailState.updateRules}
						onSave={() => void saveRules()}
						onGiveEmailFeedback={showFeedbackView}
					/>
				{:else if feedbackViewState.kind === 'selected'}
					<OpportunityFeedbackPanel
						likedValue={feedbackViewState.feedbackDraft.likedText}
						improvementValue={feedbackViewState.feedbackDraft.improvementText}
						canSave={feedbackViewState.canSave}
						onLikedValueChange={(nextValue) => {
							updateSelectedFeedback({ likedText: nextValue });
						}}
						onImprovementValueChange={(nextValue) => {
							updateSelectedFeedback({ improvementText: nextValue });
						}}
						onSave={saveSelectedFeedback}
					/>
				{/if}
			{/snippet}
		</SplitPane>
	{/if}
</div>

<div
	class={isMobileAttachmentOpen && detailState.emailDraft.attachment
		? 'h-full min-h-0 bg-white md:hidden'
		: 'min-h-full bg-white px-4 py-4 md:hidden'}
>
	{#if detailQuery.isLoading}
		<div class="flex min-h-60 items-center justify-center text-[0.74rem] text-zinc-500">
			Loading format...
		</div>
	{:else if detailQuery.error}
		<div class="flex min-h-60 items-center justify-center text-[0.74rem] text-red-600">
			Could not load format.
		</div>
	{:else if !detail}
		<div class="flex min-h-60 items-center justify-center text-[0.74rem] text-zinc-500">
			Format not found.
		</div>
	{:else if isMobileAttachmentOpen && detailState.emailDraft.attachment}
		<div class="flex h-full min-h-0 w-full flex-col">
			<EmailAttachmentSpreadsheetPreview
				attachment={detailState.emailDraft.attachment}
				onClose={closeMobileAttachment}
			/>
		</div>
	{:else}
		<div class="space-y-5">
			<section>
				<EmailComposePreview
					draft={detailState.emailDraft}
					onOpenAttachment={showMobileAttachment}
				/>
			</section>

			<section class="border-t border-zinc-100 pt-4">
				<OpportunityFormatRulesPanel
					rules={detailState.rulesDraft}
					canSave={detailState.canSaveRules}
					onRulesChange={detailState.updateRules}
					onSave={() => void saveRules()}
				/>
			</section>
		</div>
	{/if}
</div>
