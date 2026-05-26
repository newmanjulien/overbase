<script lang="ts">
	import EmailDraftPanel from '$lib/domain/email-drafts/EmailDraftPanel.svelte';
	import SplitPane from '$lib/layout/split-pane/SplitPane.svelte';
	import type { EmailDraft } from '@overbase/builder-sdk/email';
	import OpportunityFeedbackEmptyState from './OpportunityFeedbackEmptyState.svelte';
	import OpportunityFeedbackPanel from './OpportunityFeedbackPanel.svelte';
	import OpportunityFormatRulesPanel from './OpportunityFormatRulesPanel.svelte';
	import OpportunityPreviewPanel from './OpportunityPreviewPanel.svelte';
	import type { OpportunityFormatDetailState } from './opportunity-format-detail-state.svelte';
	import type {
		OpportunityFeedback,
		OpportunityFeedbackViewState,
		OpportunityFormatDetailLoadState,
		OpportunityFormatDetailView
	} from './opportunity-format-detail-types';

	type Props = {
		actionError: string | null;
		deleteError: string | null;
		detailState: OpportunityFormatDetailState;
		detailView: OpportunityFormatDetailView;
		feedbackViewState: OpportunityFeedbackViewState;
		loadState: OpportunityFormatDetailLoadState;
		onFeedbackChange: (patch: Partial<OpportunityFeedback>) => void;
		onSaveDraft: (nextDraft: EmailDraft, baseEmailDraftVersion: number) => Promise<void>;
		onSaveFeedback: () => void | Promise<void>;
		onSaveRules: () => void | Promise<void>;
		onShowFeedbackView: () => void;
		onShowNextOpportunity: () => void;
		onShowPreviousOpportunity: () => void;
	};

	const OPPORTUNITY_FORMAT_DETAIL_SPLIT = {
		minPrimary: 320,
		minSecondary: 420,
		defaultRatio: 0,
		mobileBreakpoint: 741,
		keyboardStep: 24,
		handleWidth: 1
	} as const;

	let {
		actionError,
		deleteError,
		detailState,
		detailView,
		feedbackViewState,
		loadState,
		onFeedbackChange,
		onSaveDraft,
		onSaveFeedback,
		onSaveRules,
		onShowFeedbackView,
		onShowNextOpportunity,
		onShowPreviousOpportunity
	}: Props = $props();
</script>

<div class="hidden h-full min-h-0 md:block">
	{#if deleteError || actionError}
		<p class="border-b border-red-100 bg-red-50 px-5 py-2 text-[0.72rem] text-red-700">
			{deleteError ?? actionError}
		</p>
	{/if}
	{#if loadState === 'loading'}
		<div class="flex h-full items-center justify-center text-[0.74rem] text-stone-500">
			Loading format...
		</div>
	{:else if loadState === 'error'}
		<div class="flex h-full items-center justify-center text-[0.74rem] text-red-600">
			Could not load format.
		</div>
	{:else if loadState === 'notFound'}
		<div class="flex h-full items-center justify-center text-[0.74rem] text-stone-500">
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
						onSave={onSaveDraft}
					/>
				{:else if feedbackViewState.kind === 'selected'}
					<OpportunityPreviewPanel
						opportunity={feedbackViewState.opportunity}
						canGoPrevious={feedbackViewState.canGoPrevious}
						canGoNext={feedbackViewState.canGoNext}
						onPrevious={onShowPreviousOpportunity}
						onNext={onShowNextOpportunity}
					/>
				{/if}
			{/snippet}

			{#snippet secondary()}
				{#if detailView === 'rules'}
					<OpportunityFormatRulesPanel
						rules={detailState.rulesDraft}
						canSave={detailState.canSaveRules}
						onRulesChange={detailState.updateRules}
						onSave={() => void onSaveRules()}
						onGiveEmailFeedback={onShowFeedbackView}
					/>
				{:else if feedbackViewState.kind === 'selected'}
					<OpportunityFeedbackPanel
						likedValue={feedbackViewState.feedbackDraft.likedText}
						improvementValue={feedbackViewState.feedbackDraft.improvementText}
						canSave={feedbackViewState.canSave}
						onLikedValueChange={(nextValue) => {
							onFeedbackChange({ likedText: nextValue });
						}}
						onImprovementValueChange={(nextValue) => {
							onFeedbackChange({ improvementText: nextValue });
						}}
						onSave={onSaveFeedback}
					/>
				{/if}
			{/snippet}
		</SplitPane>
	{/if}
</div>
