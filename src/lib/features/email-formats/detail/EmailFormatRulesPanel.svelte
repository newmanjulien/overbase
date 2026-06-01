<script lang="ts">
	import {
		EmailFormatRulePanel,
		LinkDataSourcesModal
	} from '$lib/domain/email-format-rules';
	import type { EmailFormatRule } from './email-format-detail-types';
	import SectionConflictActions from './SectionConflictActions.svelte';

	type Props = {
		rules: EmailFormatRule[];
		canSave: boolean;
		conflict: boolean;
		isSaving?: boolean;
		onRulesChange: (rules: EmailFormatRule[]) => void;
		onSave: () => void;
		onKeepMine: () => void | Promise<void>;
		onUseLatest: () => void;
		onGiveEmailFeedback?: () => void;
	};

	let {
		rules,
		canSave,
		conflict,
		isSaving = false,
		onRulesChange,
		onSave,
		onKeepMine,
		onUseLatest,
		onGiveEmailFeedback
	}: Props = $props();
	let linkDataSourcesModalOpen = $state(false);
</script>

<div class="flex h-full min-h-0 min-w-0 flex-col">
	<div class="min-h-0 flex-1">
		<EmailFormatRulePanel
			{rules}
			canSave={canSave && !isSaving}
			{onRulesChange}
			{onSave}
			{onGiveEmailFeedback}
			onLinkDataSources={() => (linkDataSourcesModalOpen = true)}
			showFeedbackHint
		/>
	</div>
	{#if conflict}
		<div class="shrink-0 border-t border-stone-100 bg-white px-4 py-3 md:px-5">
			<SectionConflictActions
				{conflict}
				{isSaving}
				{onKeepMine}
				{onUseLatest}
			/>
		</div>
	{/if}
</div>

<LinkDataSourcesModal open={linkDataSourcesModalOpen} onClose={() => (linkDataSourcesModalOpen = false)} />
