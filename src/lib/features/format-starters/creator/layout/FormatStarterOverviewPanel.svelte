<script lang="ts">
	import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon';
	import { toFormatStarterArtworkPreset } from '$lib/features/format-starters/artwork';
	import type { FormatStarter } from '$lib/features/format-starters/catalog';
	import FormatStarterPanelArtwork from './FormatStarterPanelArtwork.svelte';

	type Props = {
		formatStarter: FormatStarter;
	};

	let { formatStarter }: Props = $props();
	let detailsExpanded = $state(false);

	const artwork = $derived(toFormatStarterArtworkPreset(formatStarter.artwork));
	const componentId = $props.id();
	const detailsId = `${componentId}-details`;
	const detailsGridRows = $derived(detailsExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]');
	const chevronClass = $derived(
		`size-3.5 text-stone-500 transition-transform duration-200 ease-out ${
			detailsExpanded ? 'rotate-180' : ''
		}`
	);
</script>

<aside class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-stone-50/50 text-stone-950">
	<div class="flex min-h-0 flex-1 items-center justify-center px-5 py-10 md:px-8">
		<article class="w-full max-w-66 rounded-sm bg-white p-4 text-stone-950 shadow-sm">
			<div class="py-5">
					<FormatStarterPanelArtwork
						backColor={artwork.panel.backColor}
						frontColor={artwork.panel.frontColor}
						iconId={artwork.iconId}
						iconCenterX={artwork.panel.iconCenterX}
						iconCenterY={artwork.panel.iconCenterY}
					/>
			</div>

			<div class="px-1 pt-1 pb-5 text-center">
				<h2 class="text-xs font-medium tracking-normal text-stone-950">{formatStarter.title}</h2>
				<p class="mt-1 text-[0.7rem] leading-snug text-stone-500">{formatStarter.description}</p>

				<button
					type="button"
					class="mt-3 inline-flex items-center justify-center gap-1.5 rounded-sm px-2 py-1 text-[0.7rem] font-normal text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-950"
					aria-expanded={detailsExpanded}
					aria-controls={detailsId}
					onclick={() => {
						detailsExpanded = !detailsExpanded;
					}}
				>
					Learn more
					<CaretDownIcon
						aria-hidden="true"
						size={14}
						weight="regular"
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
							class="space-y-2 pt-3 text-center text-[0.7rem] leading-relaxed text-stone-500 transition-all duration-300 ease-out"
							class:translate-y-0={detailsExpanded}
							class:opacity-100={detailsExpanded}
							class:translate-y-1={!detailsExpanded}
							class:opacity-0={!detailsExpanded}
						>
							{#each formatStarter.details.paragraphs as paragraph (paragraph)}
								<p>{paragraph}</p>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</article>
	</div>
</aside>
