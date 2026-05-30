<script lang="ts">
	import { Button } from '$lib/ui';
	import type { BlueprintVariableDefinition } from '../../../../blueprints/model';
	import BlueprintVariablePalette from './BlueprintVariablePalette.svelte';

	type Props = {
		fields: readonly BlueprintVariableDefinition[];
	};

	let { fields }: Props = $props();
</script>

<aside class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
	<BlueprintVariablePalette {fields} />

	<div class="shrink-0 border-t border-stone-100 bg-white px-4 py-3 md:px-5">
		<div class="flex items-center justify-end">
			<Button variant="primary" class="px-3 text-[0.74rem]" disabled>
				Publish
			</Button>
		</div>
	</div>
</aside>
