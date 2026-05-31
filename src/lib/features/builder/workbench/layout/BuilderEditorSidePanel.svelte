<script lang="ts">
	import { Button } from '$lib/ui';
	import type { BuilderVariableDefinition } from '$lib/features/builder/domain';
	import BuilderActionBar from './BuilderActionBar.svelte';
	import BuilderVariablePalette from '../variables/BuilderVariablePalette.svelte';
	import type { BuilderVariableDragCoordinator } from '../variables/builder-variable-drag-coordinator.svelte';

	type Props = {
		variables: readonly BuilderVariableDefinition[];
		dragCoordinator: BuilderVariableDragCoordinator;
	};

	let { variables, dragCoordinator }: Props = $props();
</script>

<aside class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
	<BuilderVariablePalette {variables} {dragCoordinator} />
	<BuilderActionBar>
		{#snippet primary()}
			<Button
				variant="primary"
				disabled={true}
				class="h-10 w-full text-[0.8rem] md:h-8 md:w-auto md:text-[0.74rem]"
			>
				Publish
			</Button>
		{/snippet}
	</BuilderActionBar>
</aside>
