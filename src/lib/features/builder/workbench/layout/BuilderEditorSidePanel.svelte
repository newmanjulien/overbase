<script lang="ts">
	import type { BuilderVariableDefinition } from '$lib/features/builder/domain';
	import BuilderPublishActionBar from './BuilderPublishActionBar.svelte';
	import BuilderVariablePalette from '../variables/BuilderVariablePalette.svelte';
	import type { BuilderVariableDragCoordinator } from '../variables/builder-variable-drag-coordinator.svelte';

	type Props = {
		variables: readonly BuilderVariableDefinition[];
		dragCoordinator: BuilderVariableDragCoordinator;
		publishDisabled?: boolean;
		publishLabel?: string;
		publishError?: string | null;
		onPublish?: () => void;
	};

	let {
		variables,
		dragCoordinator,
		publishDisabled = true,
		publishLabel = 'Publish',
		publishError = null,
		onPublish
	}: Props = $props();
</script>

<aside class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
	<BuilderVariablePalette {variables} {dragCoordinator} />
	<BuilderPublishActionBar
		disabled={publishDisabled}
		label={publishLabel}
		error={publishError}
		onPublish={() => onPublish?.()}
	/>
</aside>
