<script lang="ts">
	import { ChevronDown } from 'lucide-svelte';
	import type { BuilderAppRecord } from '$lib/features/builder/data';
	import BuilderPanelArtwork from '$lib/features/builder/canvas/BuilderPanelArtwork.svelte';

	type Props = {
		app: BuilderAppRecord;
	};

	let { app }: Props = $props();
	let detailsExpanded = $state(false);

	const artwork = $derived(app.artwork.panel);
	const componentId = $props.id();
	const detailsId = `${componentId}-details`;
	const detailsGridRows = $derived(detailsExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]');
	const chevronClass = $derived(
		`size-3.5 text-zinc-500 transition-transform duration-200 ease-out ${
			detailsExpanded ? 'rotate-180' : ''
		}`
	);
</script>

<aside class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-zinc-50/50 text-zinc-950">
	<div class="flex min-h-0 flex-1 items-center justify-center px-5 py-10 md:px-8">
		<article class="w-full max-w-66 rounded-sm bg-white p-4 text-zinc-950 shadow-sm">
			<div class="py-5">
				<BuilderPanelArtwork
					backColor={artwork.backColor}
					frontColor={artwork.frontColor}
					icon={artwork.icon}
					iconCenterX={artwork.iconCenterX}
					iconCenterY={artwork.iconCenterY}
				/>
			</div>

			<div class="px-1 pt-1 pb-5 text-center">
				<h2 class="text-sm font-medium tracking-normal text-zinc-950">{app.title}</h2>
				<p class="mt-1 text-xs leading-snug text-zinc-500">{app.description}</p>

				<button
					type="button"
					class="mt-3 inline-flex items-center justify-center gap-1.5 rounded-sm px-2 py-1 text-xs font-normal text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950"
					aria-expanded={detailsExpanded}
					aria-controls={detailsId}
					onclick={() => {
						detailsExpanded = !detailsExpanded;
					}}
				>
					Learn more
					<ChevronDown
						aria-hidden="true"
						class={chevronClass}
					/>
				</button>

				<div
					id={detailsId}
					class={`grid ${detailsGridRows} transition-[grid-template-rows] duration-300 ease-out`}
					aria-hidden={!detailsExpanded}
				>
					<div class="min-h-0 overflow-hidden">
						<div
							class="space-y-2 pt-3 text-center text-xs leading-relaxed text-zinc-500 transition-all duration-300 ease-out"
							class:translate-y-0={detailsExpanded}
							class:opacity-100={detailsExpanded}
							class:translate-y-1={!detailsExpanded}
							class:opacity-0={!detailsExpanded}
						>
							{#each app.details.paragraphs as paragraph (paragraph)}
								<p>{paragraph}</p>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</article>
	</div>
</aside>
