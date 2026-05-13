<script lang="ts">
	import type { ClassValue } from 'clsx';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/components/chrome/shared/cn';

	type Props = {
		title: string;
		description?: string;
		descriptionClass?: ClassValue;
		children: Snippet;
	};

	let { title, description, descriptionClass = '', children }: Props = $props();
</script>

<div class="w-full">
	<h1
		class="m-0 text-center text-[30px] font-medium leading-[1.08] tracking-[-0.02em] text-[#202124] sm:text-[clamp(28px,1.85vw,36px)]"
	>
		{title}
	</h1>
	<p class={cn('mx-auto mt-3.5 max-w-100 text-center text-sm leading-[1.45] text-[#777b82]', descriptionClass)}>
		{description}
	</p>

	<div class="mt-[clamp(26px,4vh,52px)]">
		{@render children()}
	</div>
</div>
