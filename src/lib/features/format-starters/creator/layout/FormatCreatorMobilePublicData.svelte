<script lang="ts">
	import { EmailFormatRulePanel } from '$lib/features/email-formats/rules';
	import FormatEmailEditorPanel from '../editor/FormatEmailEditorPanel.svelte';
	import FormatCreateActionBar from './FormatCreateActionBar.svelte';
	import type { EmailFormatRuleDataSourceAction } from '$domain/email-formats/data-source-actions';
	import type { EmailFormatLinkedinContactsDataSourceRequirement } from '$domain/email-formats/data-source-requirements';
	import type { EmailFormatSpec } from '$domain/email-formats';
	import type { EmailFormatRule } from '$lib/features/email-formats/rules';
	import type { PublicDataFormatStarter } from '$lib/features/format-starters/catalog';
	import type { FormatContentEditorState } from '../state/format-content-editor-state.svelte';
	import type { FormatVariableDragCoordinator } from '../variables/format-variable-drag-coordinator.svelte';

	type Props = {
		editor: FormatContentEditorState;
		rules: EmailFormatRule[];
		onRulesChange: (rules: EmailFormatRule[]) => void;
		formatStarter: PublicDataFormatStarter;
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
		editor,
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

<section
	class="flex h-full min-h-0 min-w-0 flex-col overflow-y-auto bg-white"
	role="group"
	aria-label="Rules format creator"
>
	<div class="shrink-0 border-b border-stone-100">
		<FormatEmailEditorPanel
			{editor}
			variables={formatStarter.variables}
			dragCoordinator={variableDragCoordinator}
			editPolicy={selectedFormatSpec?.contentEditPolicy}
		/>
	</div>
	<div class="shrink-0">
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
	</div>
	<FormatCreateActionBar
		disabled={createFormatDisabled}
		label={createFormatLabel}
		error={createFormatError}
		onPublish={onCreateEmailFormat}
		publishPrerequisiteHint={createFormatPrerequisiteHint}
		contactAttachmentStatus={linkedinContactsAttachmentStatus}
		onOpenContactAttachment={onOpenLinkedinContactsModal}
		buttonClass="h-10 w-full text-[0.8rem]"
	/>
</section>
