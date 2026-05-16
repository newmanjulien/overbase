<script lang="ts">
	import type { BuilderAppRecord } from '$lib/features/builder/catalog';
	import { Button } from '$lib/components/ui';
	import BuilderSetupFlow from '$lib/features/builder/guided-setup/BuilderSetupFlow.svelte';
	import type { BuilderGuideDefinition } from '$lib/features/builder/guided-setup/guide-types';
	import type { BuilderLaunchState } from '$lib/features/builder/session/builder-launch';
	import BuilderSessionWorkbench from '$lib/features/builder/workbench/BuilderSessionWorkbench.svelte';

	type Props = {
		app: BuilderAppRecord;
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
				<div class="flex h-full min-h-0 min-w-0 flex-col justify-center bg-white px-6">
					<div class="mx-auto max-w-sm text-center">
						<p class="text-[0.82rem] font-medium text-zinc-950">Start from the builder</p>
						<p class="mt-2 text-[0.72rem] leading-[1.5] text-zinc-500">
							Describe the format you want from the builder screen to start a custom email.
						</p>
						<Button
							variant="primary"
							href="/builder"
							class="mt-4 rounded-full text-[0.72rem]"
						>
							Back to builder
						</Button>
					</div>
				</div>
			{:else if guide}
				<BuilderSetupFlow
					app={context.app}
					{guide}
					onComplete={(setup) => context.startRun(setup)}
				/>
			{:else}
				<div class="flex h-full min-h-0 min-w-0 flex-col justify-center bg-white px-6">
					<div class="mx-auto max-w-sm text-center">
						<p class="text-[0.82rem] font-medium text-zinc-950">App unavailable</p>
						<p class="mt-2 text-[0.72rem] leading-[1.5] text-zinc-500">
							This format does not have a guided setup flow yet.
						</p>
					</div>
				</div>
			{/if}
		{/snippet}
	</BuilderSessionWorkbench>
{/key}
