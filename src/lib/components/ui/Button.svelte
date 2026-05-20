<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'clsx';
	import { cn } from '$lib/components/chrome/shared/cn';
	import type { ButtonHref, ButtonSize, ButtonType, ButtonVariant } from '$lib/components/ui/types';

	type Props = {
		'aria-label'?: string;
		variant?: ButtonVariant;
		size?: ButtonSize;
		type?: ButtonType;
		href?: ButtonHref;
		disabled?: boolean;
		class?: ClassValue;
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
		leading?: Snippet;
		trailing?: Snippet;
	};

	let {
		'aria-label': ariaLabel,
		variant = 'primary',
		size = 'sm',
		type = 'button',
		href,
		disabled = false,
		class: className = '',
		onclick,
		children,
		leading,
		trailing
	}: Props = $props();

	function handleClick(event: MouseEvent) {
		if (disabled) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}

		onclick?.(event);
	}

	const buttonClass = $derived(
		cn(
			'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-sm transition-colors disabled:cursor-default',
			size === 'sm'
				? 'h-8 gap-1.5 px-2.5 text-[0.74rem] font-medium'
				: 'size-8 p-0',
			variant === 'primary' &&
				'bg-zinc-950 text-white hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400',
			variant === 'secondary' &&
				'border border-zinc-200/60 bg-white text-zinc-800 hover:bg-zinc-50 disabled:opacity-55',
			variant === 'ghost' &&
				'text-zinc-700 hover:bg-zinc-100 disabled:opacity-55 disabled:hover:bg-transparent',
			className
		)
	);
</script>

{#if href}
	<a
		class={buttonClass}
		href={resolve(href as '/')}
		aria-label={ariaLabel}
		aria-disabled={disabled || undefined}
		tabindex={disabled ? -1 : undefined}
		onclick={handleClick}
	>
		{@render leading?.()}
		{@render children?.()}
		{@render trailing?.()}
	</a>
{:else}
	<button {type} class={buttonClass} aria-label={ariaLabel} {disabled} onclick={handleClick}>
		{@render leading?.()}
		{@render children?.()}
		{@render trailing?.()}
	</button>
{/if}
