<script lang="ts">
	import type { FormatVariableDefinition } from '$lib/features/format-starters/domain';
	import type { FormatVariableDragCoordinator } from '$lib/features/format-starters/creator/variables/format-variable-drag-coordinator.svelte';
	import type {
		EmailFormatContentEditPolicy,
		EmailFormatInlineTextContent,
		EmailFormatRuleDataSourceAction,
		EmailFormatRulesEditPolicy
	} from '$shared/email-format-definitions';
	import EmailFormatActivationStatusBar from './EmailFormatActivationStatusBar.svelte';
	import EmailFormatContentPanel from './EmailFormatContentPanel.svelte';
	import EmailFormatRulesPanel from './EmailFormatRulesPanel.svelte';
	import type { EmailFormatConfigureState } from './email-format-configure-state.svelte';
	import type {
		EmailFormatConfigureLoadState,
		EmailFormatRule
	} from './email-format-configure-types';
	import SectionConflictActions from './SectionConflictActions.svelte';

	type Props = {
		actionError: string | null;
		activationBlockerMessage: string | null;
		activationBlockerActionLabel?: string | null;
		activationReadyMessage: string | null;
		activationSuccessMessage: string | null;
		isUpdatingStatus: boolean;
		contentError: string | null;
		contentEditPolicy: EmailFormatContentEditPolicy | null;
		contentVariables: readonly FormatVariableDefinition[];
		configureState: EmailFormatConfigureState;
		dragCoordinator: FormatVariableDragCoordinator;
		loadState: EmailFormatConfigureLoadState;
		ruleDataSourceAction?: EmailFormatRuleDataSourceAction;
		ruleInfoCard: {
			label: string;
			content: EmailFormatInlineTextContent;
		} | null;
		rulesEditPolicy: EmailFormatRulesEditPolicy | null;
		onKeepMineContent: () => void | Promise<void>;
		onKeepMineRules: () => void | Promise<void>;
		onKeepMineTitle: () => void | Promise<void>;
		onLinkRuleDataSources?: (rule: EmailFormatRule) => void;
		onSaveContent: () => Promise<void>;
		onSaveRules: () => void | Promise<void>;
		onActivationBlockerAction?: () => void | Promise<void>;
		onActivateFormat: () => void | Promise<void>;
		onUseLatestContent: () => void;
		onUseLatestRules: () => void;
		onUseLatestTitle: () => void;
	};

	let {
		actionError,
		activationBlockerMessage,
		activationBlockerActionLabel = null,
		activationReadyMessage,
		activationSuccessMessage,
		isUpdatingStatus,
		contentError,
		contentEditPolicy,
		contentVariables,
		configureState,
		dragCoordinator,
		loadState,
		ruleDataSourceAction,
		ruleInfoCard,
		rulesEditPolicy,
		onKeepMineContent,
		onKeepMineRules,
		onKeepMineTitle,
		onLinkRuleDataSources,
		onSaveContent,
		onSaveRules,
		onActivationBlockerAction,
		onActivateFormat,
		onUseLatestContent,
		onUseLatestRules,
		onUseLatestTitle
	}: Props = $props();
</script>

<div class="min-h-full bg-white px-4 py-4 md:hidden">
	{#if activationBlockerMessage}
		<EmailFormatActivationStatusBar
			message={activationBlockerMessage}
			actionLabel={activationBlockerActionLabel}
			onAction={onActivationBlockerAction}
			class="mb-4 rounded-sm"
		/>
	{:else if activationReadyMessage}
		<EmailFormatActivationStatusBar
			message={activationReadyMessage}
			kind="ready"
			actionLabel="Activate this format"
			actionDisabled={isUpdatingStatus}
			onAction={onActivateFormat}
			class="mb-4 rounded-sm"
		/>
	{:else if activationSuccessMessage}
		<EmailFormatActivationStatusBar
			message={activationSuccessMessage}
			kind="success"
			class="mb-4 rounded-sm"
		/>
	{/if}
	{#if actionError}
		<p class="mb-4 rounded-sm bg-red-50 px-3 py-2 text-[0.72rem] text-red-700">
			{actionError}
		</p>
	{/if}
	{#if configureState.titleConflict}
		<div class="mb-4 rounded-sm bg-amber-50 px-3 py-2">
			<SectionConflictActions
				conflict={configureState.titleConflict}
				isSaving={configureState.isSavingTitle}
				onKeepMine={onKeepMineTitle}
				onUseLatest={onUseLatestTitle}
			/>
		</div>
	{/if}

	{#if loadState === 'loading'}
		<div class="flex min-h-60 items-center justify-center text-[0.74rem] text-stone-500">
			Loading email format...
		</div>
	{:else if loadState === 'error'}
		<div class="flex min-h-60 items-center justify-center text-[0.74rem] text-red-600">
			Could not load email format.
		</div>
	{:else if loadState === 'notFound'}
		<div class="flex min-h-60 items-center justify-center text-[0.74rem] text-stone-500">
			Email format not found.
		</div>
	{:else}
		<div class="space-y-5">
			<section class="h-[72vh] min-h-[520px] overflow-hidden">
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
			</section>

			<section class="border-t border-stone-100 pt-4">
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
					onLinkDataSources={onLinkRuleDataSources}
					onKeepMine={onKeepMineRules}
					onUseLatest={onUseLatestRules}
				/>
			</section>
		</div>
	{/if}
</div>
