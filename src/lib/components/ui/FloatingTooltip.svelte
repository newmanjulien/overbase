<script lang="ts">
	import { onMount, tick, type Snippet } from 'svelte';
	import type { ClassValue } from 'clsx';
	import { cn } from '$lib/components/chrome/shared/cn';

	export type FloatingTooltipPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

	type Props = {
		id: string;
		text?: string | null;
		ariaLabel: string;
		placement?: FloatingTooltipPlacement;
		maxWidth?: number;
		triggerClass?: ClassValue;
		panelClass?: ClassValue;
		trigger: Snippet;
	};

	let {
		id,
		text = null,
		ariaLabel,
		placement = 'bottom-start',
		maxWidth = 288,
		triggerClass = '',
		panelClass = '',
		trigger
	}: Props = $props();

	let isOpen = $state(false);
	let pointerFocusPending = $state(false);
	let triggerElement = $state<HTMLButtonElement | null>(null);
	let panelElement = $state<HTMLDivElement | null>(null);
	let closeTimer: ReturnType<typeof setTimeout> | null = null;
	let panelTop = $state(0);
	let panelLeft = $state(0);
	let panelWidth = $state(288);

	const tooltipText = $derived(text?.trim() ?? '');
	const tooltipId = $derived(id.replace(/[^a-zA-Z0-9_-]/g, '-'));
	const panelStyle = $derived(
		`top: ${panelTop}px; left: ${panelLeft}px; width: ${panelWidth}px;`
	);

	$effect(() => {
		void id;
		void tooltipText;
		closeTooltip();
	});

	onMount(() => {
		function handleCapturedScroll() {
			if (isOpen) {
				updatePanelPosition();
			}
		}

		document.addEventListener('scroll', handleCapturedScroll, true);

		return () => {
			document.removeEventListener('scroll', handleCapturedScroll, true);
			clearCloseTimer();
		};
	});

	function clearCloseTimer() {
		if (!closeTimer) {
			return;
		}

		clearTimeout(closeTimer);
		closeTimer = null;
	}

	function openTooltip() {
		clearCloseTimer();
		isOpen = true;
		void updatePanelPositionAfterRender();
	}

	function closeTooltip() {
		clearCloseTimer();
		isOpen = false;
	}

	function scheduleCloseTooltip() {
		clearCloseTimer();
		closeTimer = setTimeout(closeTooltip, 80);
	}

	function toggleTooltip() {
		clearCloseTimer();
		isOpen = !isOpen;
		pointerFocusPending = false;

		if (isOpen) {
			void updatePanelPositionAfterRender();
		}
	}

	function handlePointerDown() {
		pointerFocusPending = true;
	}

	function handleFocus() {
		if (pointerFocusPending) {
			return;
		}

		openTooltip();
	}

	function handleBlur() {
		if (pointerFocusPending) {
			pointerFocusPending = false;
			return;
		}

		scheduleCloseTooltip();
	}

	function getPreferredLeft(triggerRect: DOMRect, width: number) {
		return placement.endsWith('end') ? triggerRect.right - width : triggerRect.left;
	}

	function shouldOpenAbove(triggerRect: DOMRect, panelHeight: number, gap: number, padding: number) {
		const wantsTop = placement.startsWith('top');
		const topSpace = triggerRect.top - padding;
		const bottomSpace = window.innerHeight - triggerRect.bottom - padding;

		if (wantsTop) {
			return topSpace >= panelHeight + gap || topSpace > bottomSpace;
		}

		return bottomSpace < panelHeight + gap && topSpace > bottomSpace;
	}

	function updatePanelPosition() {
		if (!triggerElement) {
			return;
		}

		const viewportPadding = 16;
		const triggerGap = 8;
		const triggerRect = triggerElement.getBoundingClientRect();
		const nextPanelWidth = Math.min(maxWidth, window.innerWidth - viewportPadding * 2);
		const panelHeight = panelElement?.getBoundingClientRect().height ?? 0;
		const preferredLeft = getPreferredLeft(triggerRect, nextPanelWidth);
		const maxLeft = window.innerWidth - nextPanelWidth - viewportPadding;
		const opensAbove = shouldOpenAbove(triggerRect, panelHeight, triggerGap, viewportPadding);
		const preferredTop = opensAbove
			? triggerRect.top - panelHeight - triggerGap
			: triggerRect.bottom + triggerGap;
		const maxTop = window.innerHeight - panelHeight - viewportPadding;

		panelWidth = nextPanelWidth;
		panelLeft = Math.max(viewportPadding, Math.min(preferredLeft, maxLeft));
		panelTop = Math.max(viewportPadding, Math.min(preferredTop, maxTop));
	}

	async function updatePanelPositionAfterRender() {
		await tick();
		updatePanelPosition();
	}

	function handleDocumentClick(event: MouseEvent) {
		if (!isOpen) {
			return;
		}

		const target = event.target;

		if (!(target instanceof Node)) {
			return;
		}

		if (triggerElement?.contains(target) || panelElement?.contains(target)) {
			return;
		}

		closeTooltip();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape' || !isOpen) {
			return;
		}

		event.preventDefault();
		closeTooltip();
		triggerElement?.focus();
	}
</script>

{#if tooltipText}
	<span class="inline-flex items-center">
		<button
			bind:this={triggerElement}
			type="button"
			class={cn(triggerClass)}
			aria-label={ariaLabel}
			aria-describedby={isOpen ? tooltipId : undefined}
			aria-expanded={isOpen}
			onmouseenter={openTooltip}
			onmouseleave={scheduleCloseTooltip}
			onpointerdown={handlePointerDown}
			onfocus={handleFocus}
			onblur={handleBlur}
			onclick={toggleTooltip}
		>
			{@render trigger()}
		</button>

		{#if isOpen}
			<div
				bind:this={panelElement}
				id={tooltipId}
				role="tooltip"
				class={cn(
					'fixed z-50 rounded-sm border border-zinc-200 bg-white px-3 py-2 text-left text-[0.74rem] leading-[1.45] text-zinc-700 shadow-sm shadow-zinc-950/8',
					panelClass
				)}
				style={panelStyle}
				onmouseenter={clearCloseTimer}
				onmouseleave={scheduleCloseTooltip}
			>
				{tooltipText}
			</div>
		{/if}
	</span>
{/if}

<svelte:document onclick={handleDocumentClick} onkeydown={handleKeydown} />
<svelte:window onresize={updatePanelPosition} />
