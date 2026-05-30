<script lang="ts">
	import type { BuilderCatalogRecord } from '$lib/features/builder/catalog';
	import BuilderSetupFlow from '$lib/features/builder/guided-setup/BuilderSetupFlow.svelte';
	import type { BuilderGuideDefinition } from '$lib/features/builder/guided-setup/guide-types';
	import type { BuilderLaunchState } from '$lib/features/builder/session/builder-launch';
	import BuilderSessionWorkbench from '$lib/features/builder/workbench/BuilderSessionWorkbench.svelte';
	import CustomBuilderStarter from '$lib/features/builder/workbench/CustomBuilderStarter.svelte';

	type Props = {
		app: BuilderCatalogRecord;
		guide: BuilderGuideDefinition | null;
		launch?: BuilderLaunchState | null;
	};

	let { app, guide, launch = null }: Props = $props();
	const isCustomEmailBuilder = $derived(app.mode === 'custom');
</script>

{#key app.id}
	<BuilderSessionWorkbench {app} {launch}>
		{#snippet beforeRun(context)}
			{#if isCustomEmailBuilder}
				<CustomBuilderStarter {context} />
			{:else if guide}
				<BuilderSetupFlow
					app={context.app}
					{guide}
					onComplete={(setup) => context.startRun(setup)}
				/>
			{:else}
				<div class="flex h-full min-h-0 min-w-0 flex-col justify-center bg-white px-6">
					<div class="mx-auto max-w-sm text-center">
						<p class="text-[0.82rem] font-medium text-stone-950">App unavailable</p>
						<p class="mt-2 text-[0.72rem] leading-[1.5] text-stone-500">
							This email format does not have a guided setup flow yet.
						</p>
					</div>
				</div>
			{/if}
		{/snippet}
	</BuilderSessionWorkbench>
{/key}
