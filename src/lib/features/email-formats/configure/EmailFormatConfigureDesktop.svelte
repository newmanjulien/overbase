<script lang="ts">
	import SplitPane from '$lib/layout/split-pane/SplitPane.svelte';
	import type { FormatVariableDefinition } from '$lib/features/format-starters/domain';
	import type { FormatVariableDragCoordinator } from '$lib/features/format-starters/creator/variables/format-variable-drag-coordinator.svelte';
	import type {
		EmailFormatContentEditPolicy,
		EmailFormatInlineTextContent,
		EmailFormatRuleDataSourceAction,
		EmailFormatRulesEditPolicy
	} from '$shared/email-format-definitions';
	import EmailFeedbackEmptyState from './EmailFeedbackEmptyState.svelte';
	import EmailFormatActivationStatusBar from './EmailFormatActivationStatusBar.svelte';
	import EmailFeedbackPanel from './EmailFeedbackPanel.svelte';
	import EmailFormatContentPanel from './EmailFormatContentPanel.svelte';
	import EmailFormatRulesPanel from './EmailFormatRulesPanel.svelte';
	import SentEmailPreviewPanel from './SentEmailPreviewPanel.svelte';
	import type { EmailFormatConfigureState } from './email-format-configure-state.svelte';
	import type {
		EmailFeedback,
		EmailFeedbackViewState,
		EmailFormatConfigureLoadState,
		EmailFormatConfigureView
	} from './email-format-configure-types';
	import SectionConflictActions from './SectionConflictActions.svelte';

	type Props = {
		actionError: string | null;
		deleteError: string | null;
		configureState: EmailFormatConfigureState;
		configureView: EmailFormatConfigureView;
		feedbackViewState: EmailFeedbackViewState;
		activationBlockerMessage: string | null;
		activationReadyMessage: string | null;
		activationSuccessMessage: string | null;
		contentError: string | null;
		contentEditPolicy: EmailFormatContentEditPolicy | null;
		contentVariables: readonly FormatVariableDefinition[];
		dragCoordinator: FormatVariableDragCoordinator;
		loadState: EmailFormatConfigureLoadState;
		ruleDataSourceAction?: EmailFormatRuleDataSourceAction;
		ruleInfoCard: {
			label: string;
			content: EmailFormatInlineTextContent;
		} | null;
		rulesEditPolicy: EmailFormatRulesEditPolicy | null;
		onFeedbackChange: (patch: Partial<EmailFeedback>) => void;
		onKeepMineContent: () => void | Promise<void>;
		onKeepMineRules: () => void | Promise<void>;
		onKeepMineTitle: () => void | Promise<void>;
		onSaveContent: () => Promise<void>;
		onSaveFeedback: () => void | Promise<void>;
		onSaveRules: () => void | Promise<void>;
		onShowNextSentEmail: () => void;
		onShowPreviousSentEmail: () => void;
		onUseLatestContent: () => void;
		onUseLatestRules: () => void;
		onUseLatestTitle: () => void;
	};

	const EMAIL_FORMAT_CONFIGURE_SPLIT = {
		minPrimary: 320,
		minSecondary: 400,
		defaultRatio: 0.35,
		mobileBreakpoint: 741,
		keyboardStep: 24,
		handleWidth: 1
	} as const;

	let {
		actionError,
		deleteError,
		configureState,
		configureView,
		feedbackViewState,
		activationBlockerMessage,
		activationReadyMessage,
		activationSuccessMessage,
		contentError,
		contentEditPolicy,
		contentVariables,
		dragCoordinator,
		loadState,
		ruleDataSourceAction,
		ruleInfoCard,
		rulesEditPolicy,
		onFeedbackChange,
		onKeepMineContent,
		onKeepMineRules,
		onKeepMineTitle,
		onSaveContent,
		onSaveFeedback,
		onSaveRules,
		onShowNextSentEmail,
		onShowPreviousSentEmail,
		onUseLatestContent,
		onUseLatestRules,
		onUseLatestTitle
	}: Props = $props();
</script>

<div class="hidden h-full min-h-0 flex-col overflow-hidden md:flex">
	<div class="shrink-0">
		{#if activationBlockerMessage}
			<EmailFormatActivationStatusBar message={activationBlockerMessage} />
		{:else if activationReadyMessage}
			<EmailFormatActivationStatusBar
				message={activationReadyMessage}
				kind="ready"
			/>
		{:else if activationSuccessMessage}
			<EmailFormatActivationStatusBar
				message={activationSuccessMessage}
				kind="success"
			/>
		{/if}
		{#if deleteError || actionError}
			<p class="bg-red-50 px-5 py-2 text-[0.72rem] text-red-700">
				{deleteError ?? actionError}
			</p>
		{/if}
		{#if configureState.titleConflict}
			<div class="bg-amber-50 px-5 py-2">
				<SectionConflictActions
					conflict={configureState.titleConflict}
					isSaving={configureState.isSavingTitle}
					onKeepMine={onKeepMineTitle}
					onUseLatest={onUseLatestTitle}
				/>
			</div>
		{/if}
	</div>

	<div class="min-h-0 flex-1 overflow-hidden">
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
		{:else if configureView === 'feedback' && feedbackViewState.kind === 'empty'}
			<EmailFeedbackEmptyState />
		{:else}
			<SplitPane
				minPrimary={EMAIL_FORMAT_CONFIGURE_SPLIT.minPrimary}
				minSecondary={EMAIL_FORMAT_CONFIGURE_SPLIT.minSecondary}
				defaultRatio={EMAIL_FORMAT_CONFIGURE_SPLIT.defaultRatio}
				mobileBreakpoint={EMAIL_FORMAT_CONFIGURE_SPLIT.mobileBreakpoint}
				keyboardStep={EMAIL_FORMAT_CONFIGURE_SPLIT.keyboardStep}
				handleWidth={EMAIL_FORMAT_CONFIGURE_SPLIT.handleWidth}
				label="Resize email format configuration panels"
			>
				{#snippet primary()}
					{#if configureView === 'rules'}
						<EmailFormatContentPanel
							editor={configureState.contentEditor}
							variables={contentVariables}
							{dragCoordinator}
							editPolicy={contentEditPolicy}
							canSave={configureState.canSaveContent}
							conflict={configureState.contentConflict}
							isSaving={configureState.isSavingContent}
							error={contentError}
							onSave={onSaveContent}
							onKeepMine={onKeepMineContent}
							onUseLatest={onUseLatestContent}
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
					{#if configureView === 'rules'}
						<EmailFormatRulesPanel
							rules={configureState.rulesDraft}
							editPolicy={rulesEditPolicy}
							{ruleDataSourceAction}
							{ruleInfoCard}
							canSave={configureState.canSaveRules}
							conflict={configureState.rulesConflict}
							isSaving={configureState.isSavingRules}
							onRulesChange={configureState.updateRules}
							onSave={() => void onSaveRules()}
							onKeepMine={onKeepMineRules}
							onUseLatest={onUseLatestRules}
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
</div>
