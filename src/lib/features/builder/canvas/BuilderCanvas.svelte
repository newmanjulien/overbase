<script lang="ts">
	import type { BuilderAppRecord } from '$lib/features/builder/data';
	import CustomEmailBuilderWorkbench from '$lib/features/builder/canvas/CustomEmailBuilderWorkbench.svelte';
	import GuidedBuilderWorkbench from '$lib/features/builder/canvas/GuidedBuilderWorkbench.svelte';
	import type { BuilderGuideDefinition } from '$lib/features/builder/guide/guide-types';
	import type { BuilderLaunchState } from '$lib/features/builder/session/builder-launch';

	type Props = {
		app: BuilderAppRecord;
		guide: BuilderGuideDefinition | null;
		launch?: BuilderLaunchState | null;
	};

	let { app, guide, launch = null }: Props = $props();
	const isCustomEmailBuilder = $derived(app.mode === 'custom');
</script>

{#key app.id}
	{#if isCustomEmailBuilder}
		<CustomEmailBuilderWorkbench {app} {launch} />
	{:else}
		<GuidedBuilderWorkbench {app} {guide} {launch} />
	{/if}
{/key}
