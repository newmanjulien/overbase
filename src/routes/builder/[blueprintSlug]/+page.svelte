<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import PageShell from '$lib/components/layout/PageShell.svelte';
	import BuilderCanvas from '$lib/features/builder/canvas/BuilderCanvas.svelte';
	import BuilderDesktopOnly from '$lib/features/builder/canvas/BuilderDesktopOnly.svelte';
	import { toBuilderBlueprintRecord, toBuilderGuideDefinition } from '$lib/features/builder/data';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const blueprint = $derived(data.blueprint ? toBuilderBlueprintRecord(data.blueprint) : null);
	const guide = $derived(toBuilderGuideDefinition(data.guide));
	const initialMessage = $derived(page.state.initialMessage ?? null);
	const activeConversation = $derived(page.state.activeConversation ?? null);
</script>

<PageShell class="px-0 py-0 md:px-0 md:py-0">
		<BuilderDesktopOnly>
			{#if blueprint}
				<BuilderCanvas {blueprint} {guide} {initialMessage} {activeConversation} />
			{:else}
			<div class="flex h-full min-h-full items-center justify-center bg-white px-6 py-12">
				<div class="w-full max-w-sm rounded-sm border border-zinc-200 bg-white p-5 text-center shadow-sm">
						<p class="text-sm font-medium text-zinc-950">Builder blueprint not found</p>
						<p class="mt-2 text-xs leading-relaxed text-zinc-500">
							Choose a notification blueprint from the builder to start a new draft.
						</p>
					<a
						href={resolve('/builder')}
						class="mt-4 inline-flex h-8 items-center justify-center rounded-full bg-zinc-950 px-3.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800"
					>
						Back to builder
					</a>
				</div>
			</div>
		{/if}
	</BuilderDesktopOnly>
</PageShell>
