<script lang="ts">
	import { Search } from 'lucide-svelte';
	import { cn } from '$lib/chrome/shared/cn';

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
	<Search
		aria-hidden="true"
		class="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400"
	/>
	<input
		type="search"
		{placeholder}
		{readonly}
		class="h-full w-full rounded-sm border border-zinc-200 bg-white pr-3 pl-8.5 text-[0.76rem] text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-300 md:text-[0.78rem]"
	/>
</label>
