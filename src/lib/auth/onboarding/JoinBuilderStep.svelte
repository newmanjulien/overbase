<script lang="ts">
	import { resolve } from '$app/paths';
	import { BUILDER_FRESH_START_ROUTE, builderAppSlugParams } from '$lib/features/builder/paths';
	import BuilderAppCardArtwork from '$lib/features/builder/home/artwork/BuilderAppCardArtwork.svelte';
	import type { BuilderAppRecord } from '$lib/features/builder/catalog';

	type Props = {
		apps: BuilderAppRecord[];
		isLoading: boolean;
		errorText: string | null;
		completionErrorText: string | null;
		selectedAppSlug: string | null;
		isOpeningBuilder: boolean;
		onSelect: (appSlug: string) => void;
		onPreload: (appSlug: string) => void;
		onOpenBuilder: () => void;
		onRetry: () => void;
	};

	let {
		apps,
		isLoading,
		errorText,
		completionErrorText,
		selectedAppSlug,
		isOpeningBuilder,
		onSelect,
		onPreload,
		onOpenBuilder,
		onRetry
	}: Props = $props();
	const isCompletingOnboarding = $derived(Boolean(selectedAppSlug) || isOpeningBuilder);

	function selectApp(event: MouseEvent, app: BuilderAppRecord) {
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
		onSelect(app.id);
	}

	function preloadApp(app: BuilderAppRecord) {
		if (!isCompletingOnboarding) {
			onPreload(app.id);
		}
	}
</script>

<section
	class="flex min-h-dvh items-center justify-center overflow-auto bg-white px-6 py-16 text-[#202124]"
	aria-label="Recommended builders"
>
	<div class="w-full max-w-120 text-center">
		<h1 class="mt-5 mb-0 text-[30px] leading-[1.08] font-medium text-[#08090a]">
			Step 1: Create an opportunity format
		</h1>
		<p class="mx-auto mt-4 max-w-130 text-sm leading-[1.45] text-[#686b73]">
			Get started quickly with Overbase by creating the format we will use to send revenue opportunities to your team
		</p>

		<div class="mt-10 flex justify-center">
			{#if isLoading}
				<div class="w-full max-w-75 text-center">
					<p class="text-sm font-medium leading-6 text-[#686b73]">Loading available builders...</p>
					{#if completionErrorText}
						<p class="mt-4 text-sm leading-5 text-red-600">{completionErrorText}</p>
					{/if}
					<button
						type="button"
						class="mt-5 text-sm text-zinc-400/50 underline underline-offset-2 transition hover:text-zinc-400/70 focus-visible:rounded-sm focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgb(113_113_122_/_20%)] disabled:cursor-not-allowed disabled:text-zinc-300"
						disabled={isCompletingOnboarding}
						onclick={onOpenBuilder}
					>
						{isOpeningBuilder ? 'Opening builder...' : 'Let me explore the app on my own'}
					</button>
				</div>
			{:else if errorText}
				<div class="w-full max-w-75 text-left">
					<p class="text-sm font-medium leading-6 text-[#686b73]">{errorText}</p>
					<button
						type="button"
						class="mt-4 inline-flex h-8 items-center justify-center rounded-md bg-black px-3.5 text-xs font-semibold text-white outline-none transition hover:bg-[#202124] focus-visible:shadow-[0_0_0_3px_rgb(0_0_0_/_18%)]"
						onclick={onRetry}
					>
						Try again
					</button>
				</div>
			{:else if apps.length > 0}
				<div class="w-full">
					<div class="grid w-full grid-cols-1 justify-items-center gap-x-5 gap-y-5 sm:grid-cols-[repeat(auto-fit,minmax(250px,280px))] sm:justify-center">
						{#each apps as app (app.id)}
							<a
								href={resolve(BUILDER_FRESH_START_ROUTE, builderAppSlugParams(app.id))}
								class="flex min-h-70 w-full flex-col rounded-lg border border-zinc-200/60 bg-white p-2 text-left outline-none transition-[border-color,box-shadow,transform,opacity] duration-150 hover:-translate-y-0.5 hover:border-zinc-200 focus-visible:-translate-y-0.5 focus-visible:border-zinc-300 focus-visible:shadow-[0_0_0_3px_rgb(24_24_27_/_14%)] aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
								aria-label={`Start with ${app.title}`}
								aria-disabled={isCompletingOnboarding}
								tabindex={isCompletingOnboarding ? -1 : 0}
								onpointerenter={() => preloadApp(app)}
								onfocus={() => preloadApp(app)}
								onclick={(event) => selectApp(event, app)}
							>
								<div class="rounded-[0.45rem] bg-zinc-50 p-1">
									<BuilderAppCardArtwork artwork={app.artwork.card} />
								</div>

								<div class="flex min-h-0 flex-1 flex-col px-1.5 pt-3">
									<h2 class="truncate text-[0.9rem] font-medium text-zinc-950">
										{app.title}
									</h2>
									<p class="mt-1.5 line-clamp-2 text-[0.78rem] leading-snug text-zinc-500">
										{app.description}
									</p>
									<span
										class="mt-4 inline-flex h-9 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-md border border-zinc-200/60 bg-white px-3.5 text-[0.76rem] font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
									>
										{selectedAppSlug === app.id ? 'Opening...' : 'Create this format'}
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
						class="mt-7 text-sm text-zinc-400/50 underline underline-offset-2 transition hover:text-zinc-400/70 focus-visible:rounded-sm focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgb(113_113_122_/_20%)] disabled:cursor-not-allowed disabled:text-zinc-300"
						disabled={isCompletingOnboarding}
						onclick={onOpenBuilder}
					>
						{isOpeningBuilder ? 'Opening builder...' : 'Let me explore the app on my own'}
					</button>
				</div>
			{:else}
				<div class="w-full max-w-75 text-center">
					<p class="text-sm font-medium leading-6 text-[#686b73]">
						No builders are available right now
					</p>
					{#if completionErrorText}
						<p class="mt-4 text-sm leading-5 text-red-600">{completionErrorText}</p>
					{/if}
					<button
						type="button"
						class="mt-4 inline-flex h-8 items-center justify-center rounded-md bg-black px-3.5 text-xs font-semibold text-white outline-none transition hover:bg-[#202124] focus-visible:shadow-[0_0_0_3px_rgb(0_0_0_/_18%)] disabled:cursor-not-allowed disabled:bg-zinc-300"
						disabled={isCompletingOnboarding}
						onclick={onOpenBuilder}
					>
						{isOpeningBuilder ? 'Opening...' : 'Open builder'}
					</button>
				</div>
			{/if}
		</div>
	</div>
</section>
