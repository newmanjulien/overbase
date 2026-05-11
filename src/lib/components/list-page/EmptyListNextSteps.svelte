<script lang="ts">
	import { resolve } from '$app/paths';
	import type { EmptyListNextStepsContent } from '$lib/components/list-page/types';

	type Props = {
		message: EmptyListNextStepsContent;
		label?: string;
		class?: string;
	};

	let { message, label = 'Next steps:', class: className = '' }: Props = $props();

	const resolveInternalHref = resolve as (href: `/${string}`) => string;
</script>

<aside
	class={`w-full rounded-[0.45rem] border border-blue-100/60 bg-blue-50/30 px-4 py-3 text-[0.76rem] leading-relaxed text-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] ${className}`}
>
	<span class="font-semibold text-zinc-950">{label}</span>
	<span class="ml-1">
		{#if typeof message === 'string'}
			{message}
		{:else}
			{#each message as part}
				{#if part.kind === 'text'}
					<span>{part.text}</span>
				{:else}
					<a
						class="text-blue-400 outline-none hover:text-blue-500 focus-visible:rounded-sm focus-visible:text-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-50"
						href={resolveInternalHref(part.href)}
					>
						{part.text}
					</a>
				{/if}
			{/each}
		{/if}
	</span>
</aside>
