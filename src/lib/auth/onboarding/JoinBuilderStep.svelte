<script lang="ts">
	import { buildFormatLink } from '$lib/app/app-links';
	import { toBuilderArtworkPreset } from '../../../builders/artwork';
	import type { BuilderGalleryEntry } from '../../../builders/registry';
	import BuilderCardArtwork from '$lib/features/builder/gallery/BuilderCardArtwork.svelte';

	type Props = {
		builders: BuilderGalleryEntry[];
		completionErrorText: string | null;
		selectedBuilderSlug: string | null;
		isOpeningBuilder: boolean;
		onSelect: (builderSlug: string) => void;
		onPreload: (builderSlug: string) => void;
		onOpenBuilder: () => void;
	};

	let {
		builders,
		completionErrorText,
		selectedBuilderSlug,
		isOpeningBuilder,
		onSelect,
		onPreload,
		onOpenBuilder
	}: Props = $props();
	const isCompletingOnboarding = $derived(Boolean(selectedBuilderSlug) || isOpeningBuilder);

	function selectBuilder(event: MouseEvent, builder: BuilderGalleryEntry) {
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
		onSelect(builder.slug);
	}

	function preloadBuilder(builder: BuilderGalleryEntry) {
		if (!isCompletingOnboarding) {
			onPreload(builder.slug);
		}
	}
</script>

<section
	class="flex min-h-dvh items-center justify-center overflow-auto bg-white px-6 py-16 text-[#202124]"
	aria-label="Recommended formats"
>
	<div class="w-full max-w-120 text-center">
		<h1 class="mt-5 mb-0 text-[30px] leading-[1.08] font-medium text-[#08090a]">
			Step 1: Start an email draft
		</h1>
		<p class="mx-auto mt-4 max-w-130 text-sm leading-[1.45] text-[#686b73]">
			Get started quickly with Overbase by shaping the draft we will use to send revenue opportunities to your team
		</p>

		<div class="mt-10 flex justify-center">
			{#if builders.length > 0}
				<div class="w-full">
					<div class="grid w-full grid-cols-1 justify-items-center gap-x-5 gap-y-5 sm:grid-cols-[repeat(auto-fit,minmax(250px,280px))] sm:justify-center">
						{#each builders as builder (builder.slug)}
							<a
								href={buildFormatLink(builder.slug).href}
								class="flex min-h-70 w-full flex-col rounded-lg border border-stone-200/60 bg-white p-2 text-left outline-none transition-[border-color,box-shadow,transform,opacity] duration-150 hover:-translate-y-0.5 hover:border-stone-200 focus-visible:-translate-y-0.5 focus-visible:border-stone-300 focus-visible:shadow-[0_0_0_3px_rgb(28_25_23_/_14%)] aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
								aria-label={`Start with ${builder.title}`}
								aria-disabled={isCompletingOnboarding}
								tabindex={isCompletingOnboarding ? -1 : 0}
								onpointerenter={() => preloadBuilder(builder)}
								onfocus={() => preloadBuilder(builder)}
								onclick={(event) => selectBuilder(event, builder)}
							>
								<div class="rounded-[0.45rem] bg-stone-50 p-1">
									<BuilderCardArtwork artwork={toBuilderArtworkPreset(builder.artwork).card} />
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
										{selectedBuilderSlug === builder.slug ? 'Opening...' : 'Start with this format'}
									</span>
								</div>
							</a>
						{/each}
					</div>
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
						{isOpeningBuilder ? 'Opening...' : 'Let me explore the app on my own'}
					</button>
				</div>
			{:else}
				<div class="w-full max-w-75 text-center">
					<p class="text-sm font-medium leading-6 text-[#686b73]">
						No formats are available right now.
					</p>
					{#if completionErrorText}
						<p class="mt-4 text-sm leading-5 text-red-600">{completionErrorText}</p>
					{/if}
					<button
						type="button"
						class="mt-4 inline-flex h-8 items-center justify-center rounded-md bg-black px-3.5 text-xs font-semibold text-white outline-none transition hover:bg-[#202124] focus-visible:shadow-[0_0_0_3px_rgb(0_0_0_/_18%)] disabled:cursor-not-allowed disabled:bg-stone-300"
						disabled={isCompletingOnboarding}
						onclick={onOpenBuilder}
					>
						{isOpeningBuilder ? 'Opening...' : 'Open build formats'}
					</button>
				</div>
			{/if}
		</div>
	</div>
</section>
