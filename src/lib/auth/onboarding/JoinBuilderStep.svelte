<script lang="ts">
	import { resolve } from '$app/paths';
	import { APP_DYNAMIC_ROUTE_IDS } from '$lib/app/app-links';
	import { toBuilderArtworkPreset } from '$lib/features/builder/artwork';
	import BuilderCardArtwork from '$lib/features/builder/gallery/BuilderCardArtwork.svelte';
	import type { JoinBuilderRecommendation } from './join-builder';

	type Props = {
		builder: JoinBuilderRecommendation;
		completionErrorText: string | null;
		selectedBuilderSlug: string | null;
		isOpeningBuilder: boolean;
		onSelect: () => void;
		onPreload: () => void;
		onOpenBuilder: () => void;
	};

	let {
		builder,
		completionErrorText,
		selectedBuilderSlug,
		isOpeningBuilder,
		onSelect,
		onPreload,
		onOpenBuilder
	}: Props = $props();
	const isCompletingOnboarding = $derived(Boolean(selectedBuilderSlug) || isOpeningBuilder);
	const artwork = $derived(toBuilderArtworkPreset(builder.artwork));

	function selectBuilder(event: MouseEvent) {
		if (isCompletingOnboarding) {
			event.preventDefault();
			return;
		}

		if (
			event.defaultPrevented ||
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		) {
			return;
		}

		event.preventDefault();
		onSelect();
	}

	function preloadBuilder() {
		if (!isCompletingOnboarding) {
			onPreload();
		}
	}
</script>

<section
	class="flex min-h-dvh items-center justify-center overflow-auto bg-white px-6 py-16 text-[#202124]"
	aria-label="Recommended format"
>
	<div class="w-full max-w-120 text-center">
		<h1 class="mt-5 mb-0 text-[30px] leading-[1.08] font-medium text-[#08090a]">
			Try Overbase with public data
		</h1>
		<p class="mx-auto mt-4 max-w-sm text-sm leading-[1.45] text-[#686b73]">
			See how Overbase works without sharing any of your internal data and with only public LinkedIn data
		</p>

		<div class="mt-10 flex justify-center">
			<div class="w-full max-w-70">
					<a
						href={resolve(APP_DYNAMIC_ROUTE_IDS.buildFormat, { builderSlug: builder.slug })}
						class="flex min-h-70 w-full flex-col rounded-lg border border-stone-200/60 bg-white p-2 text-left outline-none transition-[border-color,box-shadow,transform,opacity] duration-150 hover:-translate-y-0.5 hover:border-stone-200 focus-visible:-translate-y-0.5 focus-visible:border-stone-300 focus-visible:shadow-[0_0_0_3px_rgb(28_25_23_/_14%)] aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
					aria-label={`Start with ${builder.title}`}
					aria-disabled={isCompletingOnboarding}
					tabindex={isCompletingOnboarding ? -1 : 0}
					onpointerenter={preloadBuilder}
					onfocus={preloadBuilder}
					onclick={selectBuilder}
				>
					<div class="rounded-[0.45rem] p-1">
						<BuilderCardArtwork artwork={artwork.card} iconId={artwork.iconId} />
					</div>

					<div class="flex min-h-0 flex-1 flex-col px-1.5 pt-3">
						<h2 class="truncate text-[0.9rem] font-medium text-stone-950">
							{builder.title}
						</h2>
						<p class="mt-1.5 line-clamp-2 text-[0.78rem] leading-snug text-stone-500">
							{builder.description}
						</p>
						<span
							class="mt-4 inline-flex h-9 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-md border border-stone-200/60 bg-white px-3.5 text-[0.76rem] font-medium text-stone-800 transition-colors hover:bg-stone-50"
						>
							{selectedBuilderSlug === builder.slug ? 'Opening...' : 'Try with only LinkedIn data'}
						</span>
					</div>
				</a>
				{#if completionErrorText}
					<p class="mx-auto mt-5 max-w-75 text-sm leading-5 text-red-600">
						{completionErrorText}
					</p>
				{/if}
				<button
					type="button"
					class="mt-7 text-sm text-stone-400/50 underline underline-offset-2 transition hover:text-stone-400/70 focus-visible:rounded-sm focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgb(120_113_108_/_20%)] disabled:cursor-not-allowed disabled:text-stone-300"
					disabled={isCompletingOnboarding}
					onclick={onOpenBuilder}
				>
					{isOpeningBuilder ? 'Opening...' : 'Let me explore the full service'}
				</button>
			</div>
		</div>
	</div>
</section>
