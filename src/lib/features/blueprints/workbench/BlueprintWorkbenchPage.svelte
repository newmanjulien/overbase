<script lang="ts">
	import { useRouteTitleState } from '$lib/app/chrome/shared/route-title.svelte';
	import SplitPane from '$lib/layout/split-pane/SplitPane.svelte';
	import {
		resolveBlueprintContent,
		type BlueprintRegistryEntry
	} from '../../../../blueprints/registry';
	import type { BlueprintSetupAnswers } from '../../../../blueprints/setup';
	import BlueprintEditorSidePanel from './BlueprintEditorSidePanel.svelte';
	import BlueprintEmailEditorPanel from './BlueprintEmailEditorPanel.svelte';
	import { BlueprintEditorState } from './blueprint-editor-state.svelte';
	import BlueprintOverviewPanel from './BlueprintOverviewPanel.svelte';
	import BlueprintSetupPanel from './BlueprintSetupPanel.svelte';
	import { BLUEPRINT_WORKBENCH_SPLIT } from './split-pane';

	type BlueprintStep = 'setup' | 'editor';

	type Props = {
		blueprint: BlueprintRegistryEntry;
	};

	let { blueprint }: Props = $props();
	const routeTitleState = useRouteTitleState();
	let step = $state<BlueprintStep>('setup');
	let selectedAnswers = $state<BlueprintSetupAnswers>({});
	let editor = $state<BlueprintEditorState | null>(null);
	let activeBlueprintSlug = $state('');

	function updateAnswers(answers: BlueprintSetupAnswers) {
		selectedAnswers = answers;
	}

	function continueToEditor(answers = selectedAnswers) {
		selectedAnswers = answers;
		const template = resolveBlueprintContent(blueprint, answers);

		if (!template) {
			return;
		}

		editor = new BlueprintEditorState(template.emailContent);
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

	function resetForBlueprint() {
		step = 'setup';
		selectedAnswers = {};
		editor = null;
		routeTitleState.title = blueprint.title;
	}

	$effect(() => {
		if (activeBlueprintSlug === blueprint.slug) {
			return;
		}

		activeBlueprintSlug = blueprint.slug;
		resetForBlueprint();
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

{#key blueprint.slug}
	<SplitPane
		primarySide="right"
		minPrimary={BLUEPRINT_WORKBENCH_SPLIT.minPrimary}
		minSecondary={BLUEPRINT_WORKBENCH_SPLIT.minSecondary}
		defaultRatio={BLUEPRINT_WORKBENCH_SPLIT.defaultRatio}
		mobileBreakpoint={BLUEPRINT_WORKBENCH_SPLIT.mobileBreakpoint}
		keyboardStep={BLUEPRINT_WORKBENCH_SPLIT.keyboardStep}
		handleWidth={BLUEPRINT_WORKBENCH_SPLIT.handleWidth}
		label="Resize blueprint panels"
	>
		{#snippet primary()}
			{#if step === 'setup'}
				<BlueprintSetupPanel
					setup={blueprint.setup}
					onAnswersChange={updateAnswers}
					onSubmit={continueToEditor}
				/>
			{:else}
				<BlueprintEditorSidePanel fields={blueprint.variables} />
			{/if}
		{/snippet}

		{#snippet secondary()}
			<section class="relative h-full min-h-0 min-w-0 overflow-hidden bg-white">
				{#if step === 'setup'}
					<div class="absolute inset-0 z-10">
						<BlueprintOverviewPanel {blueprint} />
					</div>
				{:else if editor}
					<div class="absolute inset-0 z-10 opacity-100">
						<BlueprintEmailEditorPanel {editor} variables={blueprint.variables} />
					</div>
				{/if}
			</section>
		{/snippet}
	</SplitPane>
{/key}
