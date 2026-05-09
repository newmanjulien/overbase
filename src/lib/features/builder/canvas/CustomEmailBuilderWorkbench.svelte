<script lang="ts">
	import { resolve } from '$app/paths';
	import type { BuilderAppRecord } from '$lib/features/builder/data';
	import BuilderSessionWorkbench from '$lib/features/builder/canvas/BuilderSessionWorkbench.svelte';
	import type { BuilderLaunchState } from '$lib/features/builder/session/builder-launch';
	import { Button } from '$lib/components/ui';

	type Props = {
		app: BuilderAppRecord;
		launch?: BuilderLaunchState | null;
	};

	let { app, launch = null }: Props = $props();
</script>

<BuilderSessionWorkbench {app} {launch}>
	{#snippet beforeRun()}
		<div class="flex h-full min-h-0 min-w-0 flex-col justify-center bg-white px-6">
			<div class="mx-auto max-w-sm text-center">
				<p class="text-[0.82rem] font-medium text-zinc-950">Start from the builder</p>
				<p class="mt-2 text-[0.72rem] leading-[1.5] text-zinc-500">
					Describe the notification you want from the builder screen to start a custom email.
				</p>
				<Button
					variant="primary"
					href={resolve('/builder')}
					class="mt-4 rounded-full text-[0.72rem]"
				>
					Back to builder
				</Button>
			</div>
		</div>
	{/snippet}
</BuilderSessionWorkbench>
