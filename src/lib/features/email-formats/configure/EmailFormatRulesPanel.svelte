<script lang="ts">
	import {
		EmailFormatRulePanel,
		LinkDataSourcesModal
	} from '$lib/features/email-formats/rules';
	import type { EmailFormatRule } from './email-format-configure-types';
	import type {
		EmailFormatInlineTextContent,
		EmailFormatRulesEditPolicy
	} from '$domain/email-formats';
	import type { EmailFormatRuleDataSourceAction } from '$domain/email-formats/data-source-actions';
	import SectionConflictActions from './SectionConflictActions.svelte';

	const EDIT_ALL_RULE_FIELDS = {
		text: true,
		list: true,
		dataSources: true
	} satisfies EmailFormatRulesEditPolicy;

	type Props = {
		rules: EmailFormatRule[];
		editPolicy: EmailFormatRulesEditPolicy | null;
		canSave: boolean;
		conflict: boolean;
		isSaving?: boolean;
		dataSourceActions?: readonly EmailFormatRuleDataSourceAction[];
		ruleInfoCard?: {
			label: string;
			content: EmailFormatInlineTextContent;
		} | null;
		onLinkDataSources?: (rule: EmailFormatRule) => void;
		onRulesChange: (rules: EmailFormatRule[]) => void;
		onSave: () => void;
		onKeepMine: () => void | Promise<void>;
		onUseLatest: () => void;
	};

	let {
		rules,
		editPolicy,
		canSave,
		conflict,
		isSaving = false,
		dataSourceActions = [],
		ruleInfoCard = null,
		onLinkDataSources,
		onRulesChange,
		onSave,
		onKeepMine,
		onUseLatest
	}: Props = $props();
	let linkDataSourcesModalOpen = $state(false);
	const activeEditPolicy = $derived(editPolicy ?? EDIT_ALL_RULE_FIELDS);

	function linkRuleDataSources(rule: EmailFormatRule) {
		if (onLinkDataSources) {
			onLinkDataSources(rule);
			return;
		}

		linkDataSourcesModalOpen = true;
	}
</script>

<div class="flex h-full min-h-0 min-w-0 flex-col">
	<div class="min-h-0 flex-1">
		<EmailFormatRulePanel
			{rules}
			canSave={canSave && !isSaving}
			{onRulesChange}
			{onSave}
			onLinkDataSources={activeEditPolicy.dataSources
				? linkRuleDataSources
				: undefined}
			ruleDataSourceActions={dataSourceActions}
			infoCard={ruleInfoCard ?? undefined}
			canEditRuleText={activeEditPolicy.text}
			canEditRuleList={activeEditPolicy.list}
		/>
	</div>
	{#if conflict}
		<div class="shrink-0 bg-white px-4 py-3 md:px-5">
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
