<script lang="ts" generics="Id extends string">
	import { onMount, tick } from 'svelte';
	import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon';
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';
	import { cn } from '$lib/ui/cn';

	type HeaderSelectMenuOption = {
		id: Id;
		label: string;
	};

	type Props = {
		id: string;
		ariaLabel: string;
		selectedId: Id;
		options: readonly HeaderSelectMenuOption[];
		onSelect: (id: Id) => void;
		width?: 'sm' | 'md';
		class?: string;
	};

	let {
		id,
		ariaLabel,
		selectedId,
		options,
		onSelect,
		width = 'sm',
		class: className = ''
	}: Props = $props();

	let open = $state(false);
	let triggerElement = $state<HTMLButtonElement | null>(null);
	let panelElement = $state<HTMLDivElement | null>(null);
	let panelTop = $state(0);
	let panelLeft = $state(0);
	let panelWidth = $state(128);
	let panelMaxHeight = $state(240);

	const widthClass = $derived(width === 'md' ? 'w-36' : 'w-32');
	const selectedLabel = $derived(options.find((option) => option.id === selectedId)?.label ?? '');
	const menuId = $derived(`${id}-menu`.replace(/[^a-zA-Z0-9_-]/g, '-'));
	const isDisabled = $derived(options.length === 0);
	const panelStyle = $derived(
		`top: ${panelTop}px; left: ${panelLeft}px; width: ${panelWidth}px; max-height: ${panelMaxHeight}px;`
	);

	onMount(() => {
		document.addEventListener('scroll', updatePanelPosition, true);

		return () => {
			document.removeEventListener('scroll', updatePanelPosition, true);
		};
	});

	$effect(() => {
		if (open && isDisabled) {
			close();
		}
	});

	$effect(() => {
		if (open) {
			void updatePanelPositionAfterRender();
		}
	});

	function toggleOpen() {
		if (isDisabled) {
			return;
		}

		open = !open;
	}

	function close({ restoreFocus = false } = {}) {
		if (!open) {
			return;
		}

		open = false;

		if (restoreFocus) {
			triggerElement?.focus();
		}
	}

	function updatePanelPosition() {
		if (!triggerElement || !open) {
			return;
		}

		const viewportPadding = 16;
		const triggerGap = 8;
		const triggerRect = triggerElement.getBoundingClientRect();
		const availablePanelWidth = Math.max(1, window.innerWidth - viewportPadding * 2);
		const minPanelWidth = Math.min(Math.max(triggerRect.width, 128), availablePanelWidth);
		const measuredPanelWidth = Math.max(
			minPanelWidth,
			panelElement?.getBoundingClientRect().width ?? 128,
			panelElement?.scrollWidth ?? 128
		);
		const maxPanelHeight = Math.max(120, window.innerHeight - viewportPadding * 2);
		const measuredPanelHeight = Math.min(panelElement?.scrollHeight ?? 0, maxPanelHeight);
		const menuWidth = Math.min(measuredPanelWidth, availablePanelWidth);
		const preferredLeft = triggerRect.right - menuWidth;
		const maxLeft = window.innerWidth - menuWidth - viewportPadding;
		const preferredTop = triggerRect.bottom + triggerGap;
		const maxTop = Math.max(
			viewportPadding,
			window.innerHeight - measuredPanelHeight - viewportPadding
		);

		panelMaxHeight = maxPanelHeight;
		panelWidth = menuWidth;
		panelLeft = Math.max(viewportPadding, Math.min(preferredLeft, maxLeft));
		panelTop = Math.max(viewportPadding, Math.min(preferredTop, maxTop));
	}

	async function updatePanelPositionAfterRender() {
		await tick();
		updatePanelPosition();
	}

	function handleDocumentClick(event: MouseEvent) {
		if (!open) {
			return;
		}

		const target = event.target;

		if (!(target instanceof Node)) {
			return;
		}

		if (triggerElement?.contains(target) || panelElement?.contains(target)) {
			return;
		}

		close();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape' || !open) {
			return;
		}

		event.preventDefault();
		close({ restoreFocus: true });
	}

	function selectOption(optionId: Id) {
		close({ restoreFocus: true });

		if (optionId !== selectedId) {
			onSelect(optionId);
		}
	}
</script>

<span class={cn('inline-flex h-7 items-center', widthClass, className)}>
	<button
		bind:this={triggerElement}
		{id}
		type="button"
		aria-label={ariaLabel}
		aria-haspopup="menu"
		aria-expanded={open}
		aria-controls={open ? menuId : undefined}
		disabled={isDisabled}
		onclick={toggleOpen}
		class="inline-flex h-7 w-full min-w-0 items-center justify-between gap-1.5 whitespace-nowrap rounded-sm border border-stone-200/70 bg-white py-0 pr-2 pl-2.5 text-left text-[0.72rem] font-normal text-stone-800 outline-none transition-colors hover:bg-stone-50 focus:border-stone-300 focus:ring-2 focus:ring-stone-200 disabled:cursor-default disabled:opacity-55 disabled:hover:bg-white"
	>
		<span class="min-w-0 truncate">{selectedLabel}</span>
		<CaretDownIcon aria-hidden="true" size={13} weight="regular" class="shrink-0 text-stone-500" />
	</button>

	{#if open}
		<div
			bind:this={panelElement}
			id={menuId}
			role="menu"
			class="fixed z-50 overflow-x-hidden overflow-y-auto rounded-sm border border-stone-200 bg-white py-1 text-left shadow-lg shadow-stone-950/5"
			style={panelStyle}
		>
			{#each options as option (option.id)}
				<button
					type="button"
					role="menuitemradio"
					aria-checked={option.id === selectedId}
					class="flex h-8 w-full items-center gap-2 px-2.5 text-left text-[0.72rem] font-normal text-stone-700 transition-colors hover:bg-stone-50"
					onclick={() => selectOption(option.id)}
				>
					<span class="flex size-3.5 shrink-0 items-center justify-center text-stone-950">
						{#if option.id === selectedId}
							<CheckIcon aria-hidden="true" size={12} weight="bold" />
						{/if}
					</span>
					<span class="whitespace-nowrap">{option.label}</span>
				</button>
			{/each}
		</div>
	{/if}
</span>

<svelte:document onclick={handleDocumentClick} onkeydown={handleKeydown} />
<svelte:window onresize={updatePanelPosition} />
