<script lang="ts">
	import { EmailFormatRulePanel } from '$lib/features/email-formats/rules';
	import FormatCreatorEditorSidePanel from './FormatCreatorEditorSidePanel.svelte';
	import FormatCreateActionBar from './FormatCreateActionBar.svelte';
	import type { EmailFormatRuleDataSourceAction } from '$domain/email-formats/data-source-actions';
	import type { EmailFormatLinkedinContactsDataSourceRequirement } from '$domain/email-formats/data-source-requirements';
	import type { EmailFormatSpec } from '$domain/email-formats';
	import type { EmailFormatRule } from '$lib/features/email-formats/rules';
	import type { FormatStarter } from '$lib/features/format-starters/catalog';
	import type { FormatVariableDragCoordinator } from '../variables/format-variable-drag-coordinator.svelte';

	type Props = {
		rules: EmailFormatRule[];
		onRulesChange: (rules: EmailFormatRule[]) => void;
		formatStarter: FormatStarter;
		selectedFormatSpec: EmailFormatSpec | null;
		variableDragCoordinator: FormatVariableDragCoordinator;
		creationDataSourceRequirement: EmailFormatLinkedinContactsDataSourceRequirement | null;
		dataSourceActions: readonly EmailFormatRuleDataSourceAction[];
		createFormatDisabled: boolean;
		createFormatLabel: string;
		createFormatError: string | null;
		createFormatPrerequisiteHint: {
			text: string;
			actionLabel: string;
			onAction: () => void;
		} | null;
		linkedinContactsAttachmentStatus: {
			count: number;
			fileName: string;
		} | null;
		onOpenLinkedinContactsModal: () => void;
		onCreateEmailFormat: () => void;
	};

	let {
		rules,
		onRulesChange,
		formatStarter,
		selectedFormatSpec,
		variableDragCoordinator,
		creationDataSourceRequirement,
		dataSourceActions,
		createFormatDisabled,
		createFormatLabel,
		createFormatError,
		createFormatPrerequisiteHint,
		linkedinContactsAttachmentStatus,
		onOpenLinkedinContactsModal,
		onCreateEmailFormat
	}: Props = $props();
</script>

{#if formatStarter.mode === 'public-data'}
	<aside class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
		<EmailFormatRulePanel
			{rules}
			{onRulesChange}
			onLinkDataSources={creationDataSourceRequirement
				? onOpenLinkedinContactsModal
				: undefined}
			ruleDataSourceActions={dataSourceActions}
			infoCard={selectedFormatSpec?.ruleInfoCard ?? undefined}
			canEditRuleText={selectedFormatSpec?.rulesEditPolicy.text ?? false}
			canEditRuleList={selectedFormatSpec?.rulesEditPolicy.list ?? false}
		/>
		<FormatCreateActionBar
			disabled={createFormatDisabled}
			label={createFormatLabel}
			error={createFormatError}
			onPublish={onCreateEmailFormat}
			publishPrerequisiteHint={createFormatPrerequisiteHint}
			contactAttachmentStatus={linkedinContactsAttachmentStatus}
			onOpenContactAttachment={onOpenLinkedinContactsModal}
		/>
	</aside>
{:else}
	<FormatCreatorEditorSidePanel
		variables={formatStarter.variables}
		dragCoordinator={variableDragCoordinator}
		publishDisabled={createFormatDisabled}
		publishLabel={createFormatLabel}
		publishError={createFormatError}
		onPublish={onCreateEmailFormat}
	/>
{/if}
