<script lang="ts">
	import MagnifyingGlass from 'phosphor-svelte/lib/MagnifyingGlass';
	import { cn } from '$lib/components/chrome/shared/cn';

	type Props = {
		placeholder: string;
		ariaLabel?: string;
		readonly?: boolean;
		class?: string;
	};

	let {
		placeholder,
		ariaLabel = placeholder,
		readonly = true,
		class: className = ''
	}: Props = $props();
</script>

<label class={cn('relative block h-8 min-w-0', className)}>
	<span class="sr-only">{ariaLabel}</span>
	<MagnifyingGlass
		aria-hidden="true"
		size={14}
		weight="regular"
		class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400"
	/>
	<input
		type="search"
		{placeholder}
		{readonly}
		class="h-full w-full rounded-sm border border-zinc-200/70 bg-white pr-3 pl-8.5 text-[0.72rem] text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-200 md:text-[0.74rem]"
	/>
</label>
