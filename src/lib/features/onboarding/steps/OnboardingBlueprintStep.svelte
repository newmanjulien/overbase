<script lang="ts">
	import { Button } from '$lib/components/ui';
	import type { BuilderAppRecord } from '$lib/features/builder/catalog';
	import OnboardingBlueprintCard from './OnboardingBlueprintCard.svelte';

	type Props = {
		apps: BuilderAppRecord[];
		isLoading: boolean;
		errorText: string | null;
		onSelect: (appSlug: string) => void;
		onOpenBuilder: () => void;
		onRetry: () => void;
	};

	let { apps, isLoading, errorText, onSelect, onOpenBuilder, onRetry }: Props = $props();
</script>

<section
	class="flex min-h-dvh items-center justify-center overflow-auto bg-white px-6 py-16 text-[#202124]"
	aria-label="Recommended blueprints"
>
	<div class="w-full max-w-120 text-center">
		<h1 class="mt-5 mb-0 text-[30px] leading-[1.08] font-medium tracking-[-0.02em] text-[#08090a]">
			Step 1: Create a notification
		</h1>
		<p class="mx-auto mt-4 max-w-130 text-sm leading-[1.45] text-[#686b73]">
			Get started quickly with Overbase by creating the notification we will send to your team when we find revenue opportunities
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
				<div class="grid w-full grid-cols-1 justify-items-center gap-x-5 gap-y-5 sm:grid-cols-[repeat(auto-fit,minmax(250px,280px))] sm:justify-center">
					{#each apps as app (app.id)}
						<OnboardingBlueprintCard {app} {onSelect} />
					{/each}
				</div>
			{:else}
				<div class="w-full max-w-[300px] text-center">
					<p class="text-sm font-medium leading-6 text-[#686b73]">
						No builder blueprints are available right now
					</p>
					<Button
						class="mt-4 inline-flex h-8 items-center justify-center rounded-lg bg-black px-3.5 text-xs font-semibold text-white outline-none transition hover:bg-[#202124] focus-visible:shadow-[0_0_0_3px_rgb(0_0_0_/_18%)]"
						onclick={onOpenBuilder}
					>
						Open builder
					</Button>
				</div>
			{/if}
		</div>
	</div>
</section>
