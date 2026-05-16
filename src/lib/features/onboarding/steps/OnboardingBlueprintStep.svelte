<script lang="ts">
	import { Button } from '$lib/components/ui';
	import type { BuilderAppRecord } from '$lib/features/builder/catalog';
	import OnboardingBlueprintCard from '../ui/OnboardingBlueprintCard.svelte';

	type Props = {
		apps: BuilderAppRecord[];
		isLoading: boolean;
		errorText: string | null;
		completionErrorText: string | null;
		selectedAppSlug: string | null;
		isOpeningBuilder: boolean;
		onSelect: (appSlug: string) => void;
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
		onOpenBuilder,
		onRetry
	}: Props = $props();
	const isCompletingOnboarding = $derived(Boolean(selectedAppSlug) || isOpeningBuilder);
</script>

<section
	class="flex min-h-dvh items-center justify-center overflow-auto bg-white px-6 py-16 text-[#202124]"
	aria-label="Recommended blueprints"
>
	<div class="w-full max-w-120 text-center">
		<h1 class="mt-5 mb-0 text-[30px] leading-[1.08] font-medium tracking-[-0.02em] text-[#08090a]">
			Step 1: Create an opportunity format
		</h1>
		<p class="mx-auto mt-4 max-w-130 text-sm leading-[1.45] text-[#686b73]">
			Get started quickly with Overbase by creating the format we will use to send revenue opportunities to your team
		</p>

		<div class="mt-10 flex justify-center">
			{#if isLoading}
				<p class="text-sm font-medium leading-6 text-[#686b73]">Loading available blueprints...</p>
			{:else if errorText}
				<div class="w-full max-w-75 text-left">
					<p class="text-sm font-medium leading-6 text-[#686b73]">{errorText}</p>
					<Button
						class="mt-4 inline-flex h-8 items-center justify-center rounded-lg bg-black px-3.5 text-xs font-semibold text-white outline-none transition hover:bg-[#202124] focus-visible:shadow-[0_0_0_3px_rgb(0_0_0_/_18%)]"
						onclick={onRetry}
					>
						Try again
					</Button>
				</div>
			{:else if apps.length > 0}
				<div class="w-full">
					<div class="grid w-full grid-cols-1 justify-items-center gap-x-5 gap-y-5 sm:grid-cols-[repeat(auto-fit,minmax(250px,280px))] sm:justify-center">
						{#each apps as app (app.id)}
							<OnboardingBlueprintCard
								{app}
								{onSelect}
								isDisabled={isCompletingOnboarding}
								isSelected={selectedAppSlug === app.id}
							/>
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
						No builder blueprints are available right now
					</p>
					{#if completionErrorText}
						<p class="mt-4 text-sm leading-5 text-red-600">{completionErrorText}</p>
					{/if}
					<Button
						class="mt-4 inline-flex h-8 items-center justify-center rounded-lg bg-black px-3.5 text-xs font-semibold text-white outline-none transition hover:bg-[#202124] focus-visible:shadow-[0_0_0_3px_rgb(0_0_0_/_18%)] disabled:cursor-not-allowed disabled:bg-zinc-300"
						disabled={isCompletingOnboarding}
						onclick={onOpenBuilder}
					>
						{isOpeningBuilder ? 'Opening...' : 'Open builder'}
					</Button>
				</div>
			{/if}
		</div>
	</div>
</section>
