<script lang="ts">
	import type { BuilderEmailContent, BuilderVariableDefinition } from '$lib/features/builder/domain';
	import BuilderEmailEditorPanel from '$lib/features/builder/workbench/editor/BuilderEmailEditorPanel.svelte';
	import type { BuilderEditorState } from '$lib/features/builder/workbench/state/builder-editor-state.svelte';
	import type { BuilderVariableDragCoordinator } from '$lib/features/builder/workbench/variables/builder-variable-drag-coordinator.svelte';
	import { Button } from '$lib/ui';

	type Props = {
		editor: BuilderEditorState | null;
		variables: readonly BuilderVariableDefinition[];
		dragCoordinator: BuilderVariableDragCoordinator;
		emailDraftVersion: number;
		isSaving?: boolean;
		error?: string | null;
		onSave: (content: BuilderEmailContent, baseEmailDraftVersion: number) => void | Promise<void>;
	};

	let {
		editor,
		variables,
		dragCoordinator,
		emailDraftVersion,
		isSaving = false,
		error = null,
		onSave
	}: Props = $props();
</script>

<section class="flex h-full min-h-0 min-w-0 flex-col bg-white" aria-label="Email format content">
	{#if editor}
		<div class="min-h-0 flex-1 overflow-hidden">
			<BuilderEmailEditorPanel {editor} {variables} {dragCoordinator} />
		</div>
		<div class="flex shrink-0 items-center justify-between gap-3 border-t border-stone-100 px-4 py-3 md:px-5">
			<div class="min-w-0">
				{#if error}
					<p class="text-[0.68rem] leading-snug text-red-600">{error}</p>
				{/if}
			</div>
			<Button
				variant="secondary"
				class="shrink-0 px-3 text-[0.74rem] text-stone-800"
				disabled={!editor.contentDirty || isSaving}
				onclick={() => void onSave(editor.activeEmailContent, emailDraftVersion)}
			>
				{isSaving ? 'Saving...' : 'Save'}
			</Button>
		</div>
	{:else}
		<div class="flex h-full items-center justify-center text-[0.74rem] text-stone-500">
			Loading email format...
		</div>
	{/if}
</section>
