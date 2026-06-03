<script lang="ts">
	import FormatStarterCard from '$lib/features/format-starters/gallery/FormatStarterCard.svelte';
	import type { JoinFormatStarterRecommendation } from './join-format-starter';

	type Props = {
		formatStarter: JoinFormatStarterRecommendation;
		completionErrorText: string | null;
		selectedFormatStarterSlug: string | null;
		isOpeningFormatStarter: boolean;
		onSelect: () => void;
		onPreload: () => void;
		onOpenFormatStarter: () => void;
	};

	let {
		formatStarter,
		completionErrorText,
		selectedFormatStarterSlug,
		isOpeningFormatStarter,
		onSelect,
		onPreload,
		onOpenFormatStarter
	}: Props = $props();
	const isCompletingOnboarding = $derived(Boolean(selectedFormatStarterSlug) || isOpeningFormatStarter);

	function selectFormatStarter(event: MouseEvent) {
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

	function preloadFormatStarter() {
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
			See how Overbase works without sharing any of your internal data and with only public data
		</p>

		<div class="mt-10 flex justify-center">
			<div class="w-full max-w-[19.6875rem]">
				<FormatStarterCard
					{formatStarter}
					disabled={isCompletingOnboarding}
					onpointerenter={preloadFormatStarter}
					onfocus={preloadFormatStarter}
					onclick={selectFormatStarter}
				/>
				{#if completionErrorText}
					<p class="mx-auto mt-5 max-w-75 text-sm leading-5 text-red-600">
						{completionErrorText}
					</p>
				{/if}
				<button
					type="button"
					class="mt-7 text-sm text-stone-400/50 underline underline-offset-2 transition hover:text-stone-400/70 focus-visible:rounded-sm focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgb(120_113_108_/_20%)] disabled:cursor-not-allowed disabled:text-stone-300"
					disabled={isCompletingOnboarding}
					onclick={onOpenFormatStarter}
				>
					{isOpeningFormatStarter ? 'Opening...' : 'Let me explore the full capabilities'}
				</button>
			</div>
		</div>
	</div>
</section>
