<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'clsx';
	import Button from '$lib/components/ui/Button.svelte';
	import type { ButtonSize, ButtonType, ButtonVariant } from '$lib/components/ui/types';

	type Props = {
		'aria-label': string;
		variant?: ButtonVariant;
		size?: ButtonSize;
		type?: ButtonType;
		href?: string;
		disabled?: boolean;
		class?: ClassValue;
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
	};

	let {
		'aria-label': ariaLabel,
		variant = 'secondary',
		size = 'icon-sm',
		type = 'button',
		href,
		disabled = false,
		class: className = '',
		onclick,
		children
	}: Props = $props();
</script>

<Button
	{variant}
	{size}
	{type}
	{href}
	{disabled}
	{onclick}
	aria-label={ariaLabel}
	class={className}
>
	{@render children?.()}
</Button>
