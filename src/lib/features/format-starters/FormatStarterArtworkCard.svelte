<script lang="ts">
	import type { ClassValue } from 'clsx';
	import ArrowUpRightIcon from 'phosphor-svelte/lib/ArrowUpRightIcon';
	import FormatStarterEmailPreview from '$lib/features/format-starters/FormatStarterEmailPreview.svelte';
	import DataSourceLogoStack from '$lib/features/format-starters/DataSourceLogoStack.svelte';
	import type { FormatStarterSampleEmail } from '$lib/features/format-starters/catalog';
	import type { DataSourceId } from '$lib/features/format-starters/data-sources';
	import { cn } from '$lib/ui/cn';

	type Props = {
		title: string;
		description?: string;
		dataSourceIds?: readonly DataSourceId[];
		sampleEmail: FormatStarterSampleEmail;
		class?: ClassValue;
	};

	let { title, description, dataSourceIds = [], sampleEmail, class: className }: Props = $props();
</script>

<div
	class={cn(
		'starter-artwork-card relative w-full overflow-hidden rounded-md border border-stone-200/40 bg-white',
		className
	)}
>
	<DataSourceLogoStack
		{dataSourceIds}
		class="absolute right-[4%] top-[8.5%] z-10"
	/>
	<div class="starter-artwork-card__document">
		<FormatStarterEmailPreview content={sampleEmail} />
	</div>
	<div class="starter-artwork-card__copy text-stone-950">
		<div class="starter-artwork-card__title-row">
			<span class="min-w-0 truncate">{title}</span>
			<span class="starter-artwork-card__title-icon" aria-hidden="true">
				<ArrowUpRightIcon size={12} weight="regular" />
			</span>
		</div>
		{#if description}
			<div class="mt-1 line-clamp-4 text-[0.725rem] leading-tight text-stone-500">
				{description}
			</div>
		{/if}
	</div>
</div>

<style>
	.starter-artwork-card {
		aspect-ratio: 1047 / 605;
	}

	.starter-artwork-card__document {
		position: absolute;
		top: calc(41.1% + 11px);
		left: calc(4.7% + 17px);
		width: 128%;
		overflow: hidden;
		border: 1px solid rgb(231 229 228 / 35%);
		border-radius: 0.35rem;
		background: white;
		box-shadow: 0 8px 14px rgb(28 25 23 / 7%);
		transform: rotate(-4.5deg);
		transform-origin: center;
		transition: transform 120ms;
	}

	:global(.format-starter-card:is(:hover, :focus-visible)) .starter-artwork-card__document {
		transform: rotate(-2.5deg);
	}

	.starter-artwork-card__copy {
		position: absolute;
		top: 9%;
		left: 5.5%;
		max-width: calc(100% - 5.5% - 4.75rem);
	}

	.starter-artwork-card__title-row {
		display: flex;
		max-width: 100%;
		min-width: 0;
		align-items: center;
		font-size: 0.7575rem;
		font-weight: 500;
		line-height: 1.08;
	}

	.starter-artwork-card__title-icon {
		flex-shrink: 0;
		margin-left: 0.25rem;
		transform: translateY(1px);
		visibility: hidden;
		transition: visibility 0ms;
	}

	:global(.format-starter-card:is(:hover, :focus-visible)) .starter-artwork-card__title-icon {
		visibility: visible;
		transition-delay: 100ms;
	}

</style>
