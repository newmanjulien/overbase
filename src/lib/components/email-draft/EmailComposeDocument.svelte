<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		to: Snippet;
		cc: Snippet;
		attachment: Snippet;
		body: Snippet;
	};

	let { to, cc, attachment, body }: Props = $props();
</script>

<div class="flex min-h-full w-full flex-1 flex-col">
	<div class="flex min-h-8 items-stretch gap-2.5">
		<div
			class="flex h-8 w-12 shrink-0 items-center justify-center rounded-sm border border-zinc-200 bg-white text-[0.64rem] font-medium text-zinc-950"
		>
			To
		</div>
		<div class="flex min-w-0 flex-1 items-center border-b border-zinc-200">
			{@render to()}
		</div>
	</div>

	<div class="mt-3 flex min-h-8 items-stretch gap-2.5">
		<div
			class="flex h-8 w-12 shrink-0 items-center justify-center rounded-sm border border-zinc-200 bg-white text-[0.64rem] font-medium text-zinc-950"
		>
			Cc
		</div>
		<div class="flex min-w-0 flex-1 items-center border-b border-zinc-200">
			{@render cc()}
		</div>
	</div>

	<div class="mt-5 border-b border-zinc-200 pb-2 text-[0.76rem] leading-snug">
		{@render attachment()}
	</div>

	<div class="pt-5 text-[0.76rem] leading-[1.52]">
		{@render body()}
	</div>
</div>
