<script lang="ts">
	import FormatCreatorEditorSidePanel from './FormatCreatorEditorSidePanel.svelte';
	import type { FormatStarter } from '$lib/features/format-starters/catalog';
	import type { FormatVariableDragCoordinator } from '../variables/format-variable-drag-coordinator.svelte';

	type Props = {
		formatStarter: FormatStarter;
		variableDragCoordinator: FormatVariableDragCoordinator;
		createFormatDisabled: boolean;
		createFormatLabel: string;
		createFormatError: string | null;
		onCreateEmailFormat: () => void;
	};

	let {
		formatStarter,
		variableDragCoordinator,
		createFormatDisabled,
		createFormatLabel,
		createFormatError,
		onCreateEmailFormat
	}: Props = $props();
</script>

<FormatCreatorEditorSidePanel
	variables={formatStarter.variables}
	dragCoordinator={variableDragCoordinator}
	publishDisabled={createFormatDisabled}
	publishLabel={createFormatLabel}
	publishError={createFormatError}
	onPublish={onCreateEmailFormat}
/>
