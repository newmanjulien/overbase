<script lang="ts">
	import type { BuilderCardRecord } from '$lib/features/builder-data';
	import BuilderBlueprintPanel from '$lib/features/builder-canvas/BuilderBlueprintPanel.svelte';
	import BuilderGuidePanel from '$lib/features/builder-guide/BuilderGuidePanel.svelte';
	import SplitPane from '$lib/features/builder-canvas/SplitPane.svelte';
	import { BUILDER_CANVAS_SPLIT } from '$lib/features/builder-canvas/split-pane';

	type Props = {
		card: BuilderCardRecord;
	};

	let { card }: Props = $props();
</script>

<SplitPane
	minPrimary={BUILDER_CANVAS_SPLIT.minPrimary}
	minSecondary={BUILDER_CANVAS_SPLIT.minSecondary}
	defaultRatio={BUILDER_CANVAS_SPLIT.defaultRatio}
	mobileBreakpoint={BUILDER_CANVAS_SPLIT.mobileBreakpoint}
	keyboardStep={BUILDER_CANVAS_SPLIT.keyboardStep}
	handleWidth={BUILDER_CANVAS_SPLIT.handleWidth}
	label="Resize builder panels"
>
	{#snippet primary()}
		<BuilderGuidePanel {card} />
	{/snippet}

	{#snippet secondary()}
		<BuilderBlueprintPanel {card} />
	{/snippet}
</SplitPane>
