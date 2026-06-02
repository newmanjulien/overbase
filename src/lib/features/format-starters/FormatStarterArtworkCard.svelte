<script lang="ts">
	import type { ClassValue } from 'clsx';
	import ArrowUpRightIcon from 'phosphor-svelte/lib/ArrowUpRightIcon';
	import { cn } from '$lib/ui/cn';

	type Props = {
		title: string;
		description?: string;
		class?: ClassValue;
	};

	let { title, description, class: className }: Props = $props();
</script>

<div
	class={cn(
		'starter-artwork-card relative w-full overflow-hidden rounded-sm border border-stone-200/60 bg-white',
		className
	)}
>
	<div class="starter-artwork-card__document">
		<img src="/artwork2.png" alt="" class="block w-full" loading="lazy" />
	</div>
	<div class="starter-artwork-card__copy text-stone-950">
		<div class="starter-artwork-card__title-row">
			<span class="min-w-0 truncate">{title}</span>
			<span class="starter-artwork-card__title-icon" aria-hidden="true">
				<ArrowUpRightIcon size={12} weight="regular" />
			</span>
		</div>
		{#if description}
			<div class="mt-1 line-clamp-4 text-[0.5825rem] leading-[1.25] text-stone-500 md:text-[0.6625rem]">
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
		transition: transform 130ms;
	}

	:global(.format-starter-card:is(:hover, :focus-visible)) .starter-artwork-card__document {
		transform: rotate(-2.5deg);
	}

	.starter-artwork-card__copy {
		position: absolute;
		top: 6%;
		left: 5.5%;
		max-width: 78%;
	}

	.starter-artwork-card__title-row {
		display: flex;
		max-width: 100%;
		min-width: 0;
		align-items: center;
		font-size: 0.6175rem;
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
		transition-delay: 110ms;
	}

	@media (width >= 48rem) {
		.starter-artwork-card__title-row {
			font-size: 0.7575rem;
		}
	}
</style>
