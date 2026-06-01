<script lang="ts">
	import type { BuilderEmailContent, BuilderVariableDefinition } from '$lib/features/builder/domain';
	import type { BuilderVariableDragCoordinator } from '$lib/features/builder/workbench/variables/builder-variable-drag-coordinator.svelte';
	import EmailFormatContentPanel from './EmailFormatContentPanel.svelte';
	import EmailFormatRulesPanel from './EmailFormatRulesPanel.svelte';
	import type { EmailFormatDetailState } from './email-format-detail-state.svelte';
	import type { EmailFormatDetailLoadState } from './email-format-detail-types';

	type Props = {
		actionError: string | null;
		contentError: string | null;
		contentVariables: readonly BuilderVariableDefinition[];
		detailState: EmailFormatDetailState;
		dragCoordinator: BuilderVariableDragCoordinator;
		isSavingContent: boolean;
		loadState: EmailFormatDetailLoadState;
		onSaveContent: (content: BuilderEmailContent, baseEmailDraftVersion: number) => Promise<void>;
		onSaveRules: () => void | Promise<void>;
	};

	let {
		actionError,
		contentError,
		contentVariables,
		detailState,
		dragCoordinator,
		isSavingContent,
		loadState,
		onSaveContent,
		onSaveRules
	}: Props = $props();
</script>

<div class="min-h-full bg-white px-4 py-4 md:hidden">
	{#if actionError}
		<p class="mb-4 rounded-sm border border-red-100 bg-red-50 px-3 py-2 text-[0.72rem] text-red-700">
			{actionError}
		</p>
	{/if}

	{#if loadState === 'loading'}
		<div class="flex min-h-60 items-center justify-center text-[0.74rem] text-stone-500">
			Loading email format...
		</div>
	{:else if loadState === 'error'}
		<div class="flex min-h-60 items-center justify-center text-[0.74rem] text-red-600">
			Could not load email format.
		</div>
	{:else if loadState === 'notFound'}
		<div class="flex min-h-60 items-center justify-center text-[0.74rem] text-stone-500">
			Email format not found.
		</div>
	{:else}
		<div class="space-y-5">
			<section class="h-[72vh] min-h-[520px] overflow-hidden">
				<EmailFormatContentPanel
					editor={detailState.contentEditor}
					variables={contentVariables}
					{dragCoordinator}
					emailDraftVersion={detailState.emailDraftVersion}
					isSaving={isSavingContent}
					error={contentError}
					onSave={onSaveContent}
				/>
			</section>

			<section class="border-t border-stone-100 pt-4">
				<EmailFormatRulesPanel
					rules={detailState.rulesDraft}
					canSave={detailState.canSaveRules}
					onRulesChange={detailState.updateRules}
					onSave={() => void onSaveRules()}
				/>
			</section>
		</div>
	{/if}
</div>
