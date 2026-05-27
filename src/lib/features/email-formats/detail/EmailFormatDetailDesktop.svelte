<script lang="ts">
	import EmailDraftPanel from '$lib/domain/email-drafts/EmailDraftPanel.svelte';
	import SplitPane from '$lib/layout/split-pane/SplitPane.svelte';
	import type { EmailDraft } from '@overbase/builder-sdk/email';
	import EmailFeedbackEmptyState from './EmailFeedbackEmptyState.svelte';
	import EmailFeedbackPanel from './EmailFeedbackPanel.svelte';
	import EmailFormatRulesPanel from './EmailFormatRulesPanel.svelte';
	import SentEmailPreviewPanel from './SentEmailPreviewPanel.svelte';
	import type { EmailFormatDetailState } from './email-format-detail-state.svelte';
	import type {
		EmailFeedback,
		EmailFeedbackViewState,
		EmailFormatDetailLoadState,
		EmailFormatDetailView
	} from './email-format-detail-types';

	type Props = {
		actionError: string | null;
		deleteError: string | null;
		detailState: EmailFormatDetailState;
		detailView: EmailFormatDetailView;
		feedbackViewState: EmailFeedbackViewState;
		loadState: EmailFormatDetailLoadState;
		onFeedbackChange: (patch: Partial<EmailFeedback>) => void;
		onSaveDraft: (nextDraft: EmailDraft, baseEmailDraftVersion: number) => Promise<void>;
		onSaveFeedback: () => void | Promise<void>;
		onSaveRules: () => void | Promise<void>;
		onShowFeedbackView: () => void;
		onShowNextSentEmail: () => void;
		onShowPreviousSentEmail: () => void;
	};

	const EMAIL_FORMAT_DETAIL_SPLIT = {
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
		onShowNextSentEmail,
		onShowPreviousSentEmail
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
			Loading email format...
		</div>
	{:else if loadState === 'error'}
		<div class="flex h-full items-center justify-center text-[0.74rem] text-red-600">
			Could not load email format.
		</div>
	{:else if loadState === 'notFound'}
		<div class="flex h-full items-center justify-center text-[0.74rem] text-stone-500">
			Email format not found.
		</div>
	{:else if detailView === 'feedback' && feedbackViewState.kind === 'empty'}
		<EmailFeedbackEmptyState />
	{:else}
		<SplitPane
			minPrimary={EMAIL_FORMAT_DETAIL_SPLIT.minPrimary}
			minSecondary={EMAIL_FORMAT_DETAIL_SPLIT.minSecondary}
			defaultRatio={EMAIL_FORMAT_DETAIL_SPLIT.defaultRatio}
			mobileBreakpoint={EMAIL_FORMAT_DETAIL_SPLIT.mobileBreakpoint}
			keyboardStep={EMAIL_FORMAT_DETAIL_SPLIT.keyboardStep}
			handleWidth={EMAIL_FORMAT_DETAIL_SPLIT.handleWidth}
			label="Resize email format detail panels"
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
					<SentEmailPreviewPanel
						sentEmail={feedbackViewState.sentEmail}
						canGoPrevious={feedbackViewState.canGoPrevious}
						canGoNext={feedbackViewState.canGoNext}
						onPrevious={onShowPreviousSentEmail}
						onNext={onShowNextSentEmail}
					/>
				{/if}
			{/snippet}

			{#snippet secondary()}
				{#if detailView === 'rules'}
					<EmailFormatRulesPanel
						rules={detailState.rulesDraft}
						canSave={detailState.canSaveRules}
						onRulesChange={detailState.updateRules}
						onSave={() => void onSaveRules()}
						onGiveEmailFeedback={onShowFeedbackView}
					/>
				{:else if feedbackViewState.kind === 'selected'}
					<EmailFeedbackPanel
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
