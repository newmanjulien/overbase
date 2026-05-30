<script lang="ts">
	import { Button } from '$lib/ui';
	import type { BuilderVariableDefinition } from '../../../../builders/model';
	import BuilderActionBar from './BuilderActionBar.svelte';
	import BuilderVariablePalette from './BuilderVariablePalette.svelte';

	type Props = {
		fields: readonly BuilderVariableDefinition[];
	};

	let { fields }: Props = $props();
</script>

<aside class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
	<BuilderVariablePalette {fields} />
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
