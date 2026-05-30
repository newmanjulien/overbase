<script lang="ts">
	import { onMount } from 'svelte';
	import { useRouteTitleState } from '$lib/app/chrome/shared/route-title.svelte';
	import SplitPane from '$lib/layout/split-pane/SplitPane.svelte';
	import { Button } from '$lib/ui';
	import {
		resolveBuilderContent,
		type BuilderRegistryEntry
	} from '../../../../builders/registry';
	import type { BuilderSetupAnswers } from '../../../../builders/setup';
	import BuilderActionBar from './BuilderActionBar.svelte';
	import BuilderEditorSidePanel from './BuilderEditorSidePanel.svelte';
	import BuilderEmailEditorPanel from './BuilderEmailEditorPanel.svelte';
	import { BuilderEditorState } from './builder-editor-state.svelte';
	import BuilderOverviewPanel from './BuilderOverviewPanel.svelte';
	import BuilderSetupPanel from './BuilderSetupPanel.svelte';
	import BuilderVariablePickerSheet from './BuilderVariablePickerSheet.svelte';
	import { BUILDER_WORKBENCH_SPLIT } from './split-pane';

	type BuilderStep = 'setup' | 'editor';

	type Props = {
		builder: BuilderRegistryEntry;
	};

	let { builder }: Props = $props();
	const routeTitleState = useRouteTitleState();
	let step = $state<BuilderStep>('setup');
	let selectedAnswers = $state<BuilderSetupAnswers>({});
	let editor = $state<BuilderEditorState | null>(null);
	let activeBuilderSlug = $state('');
	let isMobileWorkbench = $state(false);
	let variablePickerOpen = $state(false);
	let variableInsertionSequence = $state(0);
	let variableInsertionRequest = $state<{ id: number; fieldId: string } | null>(null);

	onMount(() => {
		const mediaQuery = window.matchMedia(
			`(max-width: ${BUILDER_WORKBENCH_SPLIT.mobileBreakpoint - 0.02}px)`
		);
		const updateViewport = () => {
			isMobileWorkbench = mediaQuery.matches;
		};

		updateViewport();
		mediaQuery.addEventListener('change', updateViewport);

		return () => {
			mediaQuery.removeEventListener('change', updateViewport);
		};
	});

	function updateAnswers(answers: BuilderSetupAnswers) {
		selectedAnswers = answers;
	}

	function continueToEditor(answers = selectedAnswers) {
		selectedAnswers = answers;
		const template = resolveBuilderContent(builder, answers);

		if (!template) {
			return;
		}

		editor = new BuilderEditorState(template.emailContent);
		routeTitleState.title = editor.activeEmailContent.title;
		step = 'editor';
	}

	function updateTitle(nextTitle: string) {
		if (step === 'editor' && editor) {
			editor.updateTitle(nextTitle);
			routeTitleState.title = editor.activeEmailContent.title;
			return;
		}

		routeTitleState.title = nextTitle;
	}

	function resetForBuilder() {
		step = 'setup';
		selectedAnswers = {};
		editor = null;
		variablePickerOpen = false;
		variableInsertionRequest = null;
		routeTitleState.title = builder.title;
	}

	function requestVariableInsertion(fieldId: string) {
		variableInsertionSequence += 1;
		variableInsertionRequest = {
			id: variableInsertionSequence,
			fieldId
		};
	}

	$effect(() => {
		if (activeBuilderSlug === builder.slug) {
			return;
		}

		activeBuilderSlug = builder.slug;
		resetForBuilder();
	});

	$effect(() => {
		routeTitleState.onTitleChange = updateTitle;

		return () => {
			if (routeTitleState.onTitleChange === updateTitle) {
				routeTitleState.onTitleChange = null;
			}
		};
	});

	$effect(() => {
		if (step === 'editor' && editor) {
			routeTitleState.title = editor.activeEmailContent.title;
		}
	});
</script>

{#key builder.slug}
	{#if isMobileWorkbench}
		{#if step === 'setup'}
			<BuilderSetupPanel
				setup={builder.setup}
				onAnswersChange={updateAnswers}
				onSubmit={continueToEditor}
			/>
		{:else if editor}
			<section class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
				<div class="min-h-0 flex-1 overflow-y-auto">
					<div class="min-h-[65vh] shrink-0">
						<BuilderEmailEditorPanel
							{editor}
							variables={builder.variables}
							{variableInsertionRequest}
						/>
					</div>
				</div>
				<BuilderVariablePickerSheet
					open={variablePickerOpen}
					fields={builder.variables}
					onSelect={requestVariableInsertion}
					onClose={() => (variablePickerOpen = false)}
				/>
				<BuilderActionBar mobileOrder="secondary-first">
					{#snippet secondary()}
						<Button
							variant="secondary"
							class="h-10 w-full text-[0.8rem]"
							onclick={() => (variablePickerOpen = true)}
						>
							Add variable
						</Button>
					{/snippet}

					{#snippet primary()}
						<Button
							variant="primary"
							disabled={true}
							class="h-10 w-full text-[0.8rem]"
						>
							Publish
						</Button>
					{/snippet}
				</BuilderActionBar>
			</section>
		{/if}
	{:else}
		<SplitPane
			primarySide="right"
			minPrimary={BUILDER_WORKBENCH_SPLIT.minPrimary}
			minSecondary={BUILDER_WORKBENCH_SPLIT.minSecondary}
			defaultRatio={BUILDER_WORKBENCH_SPLIT.defaultRatio}
			mobileBreakpoint={BUILDER_WORKBENCH_SPLIT.mobileBreakpoint}
			keyboardStep={BUILDER_WORKBENCH_SPLIT.keyboardStep}
			handleWidth={BUILDER_WORKBENCH_SPLIT.handleWidth}
			label="Resize build format panels"
		>
			{#snippet primary()}
				{#if step === 'setup'}
					<BuilderSetupPanel
						setup={builder.setup}
						onAnswersChange={updateAnswers}
						onSubmit={continueToEditor}
					/>
				{:else}
					<BuilderEditorSidePanel fields={builder.variables} />
				{/if}
			{/snippet}

			{#snippet secondary()}
				<section class="relative h-full min-h-0 min-w-0 overflow-hidden bg-white">
					{#if step === 'setup'}
						<div class="absolute inset-0 z-10">
							<BuilderOverviewPanel {builder} />
						</div>
					{:else if editor}
						<div class="absolute inset-0 z-10 opacity-100">
							<BuilderEmailEditorPanel {editor} variables={builder.variables} />
						</div>
					{/if}
				</section>
			{/snippet}
		</SplitPane>
	{/if}
{/key}
