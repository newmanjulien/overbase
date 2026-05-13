<script lang="ts">
	import type { Snippet } from 'svelte';
	import OnboardingHotkeyBadge from './OnboardingHotkeyBadge.svelte';

	type Props = {
		children: Snippet;
		disabled?: boolean;
		hotkey?: 'Enter';
		hotkeyLabel?: string;
		onclick: () => void;
		type?: 'button' | 'submit';
	};

	let {
		children,
		disabled = false,
		hotkey = 'Enter',
		hotkeyLabel = 'return',
		onclick,
		type = 'button'
	}: Props = $props();

	function isEditableTarget(target: EventTarget | null) {
		return (
			target instanceof HTMLInputElement ||
			target instanceof HTMLTextAreaElement ||
			target instanceof HTMLSelectElement ||
			(target instanceof HTMLElement && target.isContentEditable)
		);
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (disabled || event.key !== hotkey || isEditableTarget(event.target)) {
			return;
		}

		event.preventDefault();
		onclick();
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<button
	{type}
	{disabled}
	aria-keyshortcuts={hotkey}
	{onclick}
	class="relative flex h-[42px] w-full cursor-pointer items-center justify-center rounded-lg font-medium border-0 bg-[#1296f7] px-4 text-sm font-medium leading-none text-white outline-none transition-[background,box-shadow] duration-150 hover:bg-[#0d8eea] focus-visible:shadow-[0_0_0_3px_rgb(18_150_247_/_35%)] disabled:cursor-not-allowed disabled:bg-[#b7dffb]"
>
	<span>{@render children()}</span>
	<span class="absolute right-3 hidden sm:inline-flex">
		<OnboardingHotkeyBadge label={hotkeyLabel} />
	</span>
</button>
