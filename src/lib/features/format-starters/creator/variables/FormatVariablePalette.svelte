<script lang="ts">
	import { InfoBar } from '$lib/ui';
	import {
		formatFormatVariableLabel,
		type FormatVariableDefinition
	} from '$lib/features/format-starters/domain';
	import type { FormatVariableDragCoordinator } from './format-variable-drag-coordinator.svelte';

	type Props = {
		variables: readonly FormatVariableDefinition[];
		dragCoordinator: FormatVariableDragCoordinator;
		onVariableSelect?: (variableId: string) => void;
	};

	let { variables, dragCoordinator, onVariableSelect }: Props = $props();
	const isSelectable = $derived(Boolean(onVariableSelect));

	function startDrag(event: DragEvent, variable: FormatVariableDefinition) {
		dragCoordinator.startPaletteDrag(event, {
			...variable,
			label: formatFormatVariableLabel(variables, variable.id)
		});
	}
</script>

<div class="min-h-0 flex-1 overflow-y-auto px-5 py-5">
	<p class="mt-2 text-[0.79rem] leading-[1.55] text-stone-800">
		Add variables to your email format by {isSelectable ? 'tapping them:' : 'dragging them in:'}
	</p>

	<div class="mt-4 rounded-sm border border-stone-200/50 bg-white p-3.5">
		<div class="flex flex-wrap gap-2">
			{#each variables as variable (variable.id)}
				<button
					type="button"
					draggable={!isSelectable}
					title={variable.label}
					class={`inline-flex select-none items-center rounded-full border border-transparent bg-positive-50 px-1.5 py-[0.125rem] text-[0.73rem] font-normal leading-none text-positive-900 transition-colors hover:bg-positive-100 ${isSelectable ? 'cursor-pointer active:bg-positive-100' : 'cursor-grab active:cursor-grabbing'}`}
					ondragstart={(event) => startDrag(event, variable)}
					ondragend={() => dragCoordinator.endDrag()}
					onclick={() => onVariableSelect?.(variable.id)}
				>
					{formatFormatVariableLabel(variables, variable.id)}
				</button>
			{/each}
		</div>
	</div>

	<InfoBar label="Tip:" class="mt-4 hidden md:block">
		We're creating the format of the emails. Rules and data sources are added separately
	</InfoBar>
</div>
