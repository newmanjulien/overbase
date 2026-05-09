<script lang="ts">
	import type { BuilderAppRecord } from '$lib/features/builder/data';
	import BuilderSessionWorkbench from '$lib/features/builder/canvas/BuilderSessionWorkbench.svelte';
	import type { BuilderGuideDefinition } from '$lib/features/builder/guide/guide-types';
	import type { BuilderLaunchState } from '$lib/features/builder/session/builder-launch';
	import BuilderSetupFlow from '$lib/features/builder/setup/BuilderSetupFlow.svelte';

	type Props = {
		app: BuilderAppRecord;
		guide: BuilderGuideDefinition | null;
		launch?: BuilderLaunchState | null;
	};

	let { app, guide, launch = null }: Props = $props();
</script>

<BuilderSessionWorkbench {app} {launch}>
	{#snippet beforeRun(context)}
		{#if guide}
			<BuilderSetupFlow app={context.app} {guide} onComplete={context.startRun} />
		{:else}
			<div class="flex h-full min-h-0 min-w-0 flex-col justify-center bg-white px-6">
				<div class="mx-auto max-w-sm text-center">
					<p class="text-[0.82rem] font-medium text-zinc-950">App unavailable</p>
					<p class="mt-2 text-[0.72rem] leading-[1.5] text-zinc-500">
						This notification does not have a guided setup flow yet.
					</p>
				</div>
			</div>
		{/if}
	{/snippet}
</BuilderSessionWorkbench>
