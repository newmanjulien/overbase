<script lang="ts">
	import { InfoBar } from '$lib/ui';
	import {
		formatBuilderVariableLabel,
		type BuilderVariableDefinition
	} from '../../../../builders/model';
	import {
		encodeBuilderVariableDragPayload,
		createBuilderVariableDragImage,
		BUILDER_VARIABLE_DRAG_MIME
	} from './builder-variable-drag';

	type Props = {
		fields: readonly BuilderVariableDefinition[];
		onVariableSelect?: (fieldId: string) => void;
	};

	let { fields, onVariableSelect }: Props = $props();
	const isSelectable = $derived(Boolean(onVariableSelect));

	function startDrag(event: DragEvent, field: BuilderVariableDefinition) {
		if (!event.dataTransfer) {
			return;
		}

		const label = formatBuilderVariableLabel(fields, field.id);
		const dragImage = createBuilderVariableDragImage(label);

		event.dataTransfer.effectAllowed = 'copy';
		event.dataTransfer.setData(BUILDER_VARIABLE_DRAG_MIME, encodeBuilderVariableDragPayload(field));
		event.dataTransfer.setData('text/plain', label);
		event.dataTransfer.setDragImage(
			dragImage,
			dragImage.offsetWidth / 2,
			dragImage.offsetHeight / 2
		);

		requestAnimationFrame(() => {
			dragImage.remove();
		});
	}
</script>

<div class="min-h-0 flex-1 overflow-y-auto px-5 py-5">
	<p class="mt-2 text-[0.79rem] leading-[1.55] text-stone-800">
		Add variables to your email format by {isSelectable ? 'tapping them:' : 'dragging them in:'}
	</p>

	<div class="mt-4 rounded-sm border border-stone-200/50 bg-white p-3.5">
		<div class="flex flex-wrap gap-2">
			{#each fields as field (field.id)}
				<button
					type="button"
					draggable={!isSelectable}
					title={field.label}
					class={`inline-flex select-none items-center rounded-full border border-transparent bg-emerald-50/80 px-1.5 py-[0.125rem] text-[0.73rem] font-normal leading-none text-emerald-900 transition-colors hover:bg-emerald-100/80 ${isSelectable ? 'cursor-pointer active:bg-emerald-100' : 'cursor-grab active:cursor-grabbing'}`}
					ondragstart={(event) => startDrag(event, field)}
					onclick={() => onVariableSelect?.(field.id)}
				>
					{formatBuilderVariableLabel(fields, field.id)}
				</button>
			{/each}
		</div>
	</div>

	<InfoBar label="Tip:" class="mt-4 hidden md:block">
		We're creating the format of the emails. Rules and data sources are added separately
	</InfoBar>
</div>
