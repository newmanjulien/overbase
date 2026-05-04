<script lang="ts">
	import { Plus } from 'lucide-svelte';
	import { cn } from '$lib/chrome/shared/cn';

	type Tone = 'primary' | 'secondary';

	type Props = {
		label: string;
		tone?: Tone;
		class?: string;
	};

	let { label, tone = 'primary', class: className = '' }: Props = $props();
</script>

<button
	type="button"
	class={cn(
		'inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-sm px-3 text-[0.76rem] font-normal transition-colors md:px-3.5 md:text-[0.78rem]',
		tone === 'primary'
			? 'bg-zinc-950 text-white hover:bg-zinc-800'
			: 'border border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-50',
		className
	)}
>
	<Plus aria-hidden="true" class="size-3.5 stroke-[2.25]" />
	<span>{label}</span>
</button>
