<script lang="ts">
	import type { BuilderAppRecord } from '$lib/features/builder/catalog';
	import CustomEmailBuilderWorkbench from '$lib/features/builder/workbench/CustomEmailBuilderWorkbench.svelte';
	import GuidedBuilderWorkbench from '$lib/features/builder/workbench/GuidedBuilderWorkbench.svelte';
	import type { BuilderGuideDefinition } from '$lib/features/builder/guided-setup/guide-types';
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
