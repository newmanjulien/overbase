<script module lang="ts">
	let activeScrollLocks = 0;
	let previousBodyOverflow = '';
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'clsx';
	import { cn } from '$lib/components/chrome/shared/cn';

	type Props = {
		open: boolean;
		title: string;
		onClose: () => void;
		class?: ClassValue;
		footer?: Snippet;
		children?: Snippet;
	};

	let {
		open,
		title,
		onClose,
		class: className = '',
		footer,
		children
	}: Props = $props();

	let dialogElement = $state<HTMLDivElement | null>(null);
	let previouslyFocusedElement: HTMLElement | null = null;
	const titleId = $props.id();

	$effect(() => {
		if (!open) {
			return;
		}

		previouslyFocusedElement =
			document.activeElement instanceof HTMLElement ? document.activeElement : null;
		lockBodyScroll();
		void focusDialogAfterRender();

		return () => {
			unlockBodyScroll();
			previouslyFocusedElement?.focus();
			previouslyFocusedElement = null;
		};
	});

	async function focusDialogAfterRender() {
		await tick();
		(getFocusableElements()[0] ?? dialogElement)?.focus();
	}

	function getFocusableElements() {
		if (!dialogElement) {
			return [];
		}

		return Array.from(
			dialogElement.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
			)
		).filter((element) => element.tabIndex >= 0);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!open) {
			return;
		}

		if (event.key === 'Escape') {
			event.preventDefault();
			onClose();
			return;
		}

		if (event.key === 'Tab') {
			trapFocus(event);
		}
	}

	function trapFocus(event: KeyboardEvent) {
		const focusableElements = getFocusableElements();
		const firstElement = focusableElements[0] ?? dialogElement;
		const lastElement = focusableElements.at(-1) ?? dialogElement;
		const activeElement = document.activeElement;

		if (!dialogElement || !firstElement || !lastElement) {
			return;
		}

		if (!dialogElement.contains(activeElement)) {
			event.preventDefault();
			firstElement.focus();
			return;
		}

		if (event.shiftKey && activeElement === firstElement) {
			event.preventDefault();
			lastElement.focus();
			return;
		}

		if (!event.shiftKey && activeElement === lastElement) {
			event.preventDefault();
			firstElement.focus();
		}
	}

	function lockBodyScroll() {
		if (activeScrollLocks === 0) {
			previousBodyOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
		}

		activeScrollLocks += 1;
	}

	function unlockBodyScroll() {
		activeScrollLocks = Math.max(0, activeScrollLocks - 1);

		if (activeScrollLocks === 0) {
			document.body.style.overflow = previousBodyOverflow;
			previousBodyOverflow = '';
		}
	}

</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
		<button
			type="button"
			tabindex="-1"
			aria-label="Close modal"
			class="absolute inset-0 cursor-default bg-zinc-950/25"
			onclick={onClose}
		></button>

		<div
			bind:this={dialogElement}
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
			tabindex="-1"
			class={cn(
				'relative flex max-h-[calc(100vh-3rem)] w-full max-w-[640px] flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-2xl shadow-zinc-950/15 outline-none',
				className
			)}
		>
			<header class="px-8 pt-8 pb-6">
				<h2 id={titleId} class="text-xl leading-tight font-semibold text-zinc-950">{title}</h2>
			</header>

			<div class="min-h-56 flex-1 px-8 pb-8">
				{@render children?.()}
			</div>

			{#if footer}
				<footer class="flex shrink-0 items-center justify-between gap-3 border-t border-zinc-200 px-8 py-5">
					{@render footer()}
				</footer>
			{/if}
		</div>
	</div>
{/if}

<svelte:document onkeydown={handleKeydown} />
