<script lang="ts">
	import { Database, ExternalLink } from 'lucide-svelte';
	import { cn } from '$lib/chrome/shared/cn';
	import ResourceActionButton from '$lib/resource-index/ResourceActionButton.svelte';
	import type { ResourceIcon } from '$lib/resource-index/types';

	type Props = {
		title: string;
		description: string;
		learnMoreLabel?: string;
		actionLabel?: string;
		icon?: ResourceIcon;
		class?: string;
	};

	let {
		title,
		description,
		learnMoreLabel,
		actionLabel,
		icon: Icon = Database,
		class: className = ''
	}: Props = $props();
</script>

<div
	class={cn(
		'flex min-h-60 w-full items-center justify-center px-6 py-8 md:min-h-60',
		className
	)}
>
	<div class="flex w-full flex-col items-center text-center">
		<div class="flex max-w-56 flex-col items-center">
			<Icon aria-hidden="true" class="mb-5 size-6 text-zinc-950" />

			<h2 class="text-[0.825rem] leading-tight font-medium text-zinc-950">
				{title}
			</h2>

			<p class="mt-2.5 text-[0.7rem] leading-relaxed text-zinc-600 md:text-[0.72rem]">
				<span>{description}</span>
				{#if learnMoreLabel}
					<button
						type="button"
						class="ml-1 inline-flex items-center gap-1 text-blue-400 hover:text-blue-500"
					>
						<span>{learnMoreLabel}</span>
						<ExternalLink aria-hidden="true" class="size-3" />
					</button>
				{/if}
			</p>

			{#if actionLabel}
				<ResourceActionButton label={actionLabel} tone="secondary" class="mt-6" />
			{/if}
		</div>
	</div>
</div>
