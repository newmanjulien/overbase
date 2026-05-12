<script lang="ts">
	import { LoaderCircle } from 'lucide-svelte';

	type Props = {
		title: string;
		description: string;
	};

	let { title, description }: Props = $props();
</script>

<section class="flex min-h-dvh items-center justify-center bg-zinc-50 px-4 py-6">
	<div class="w-full max-w-md rounded-sm border border-zinc-200 bg-white px-6 py-7 text-center">
		<div
			class="mx-auto flex size-9 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50"
		>
			<LoaderCircle class="size-4 animate-spin text-zinc-950" />
		</div>
		<h1 class="mt-4 text-base font-semibold tracking-normal text-zinc-950">{title}</h1>
		<p class="mx-auto mt-2 max-w-xs text-[0.78rem] leading-relaxed text-zinc-500">{description}</p>

		<div class="mt-6 grid grid-cols-3 gap-1.5" aria-hidden="true">
			<div class="h-1 rounded-full bg-[#f47464]"></div>
			<div class="h-1 rounded-full bg-[#8bddeb]"></div>
			<div class="h-1 rounded-full bg-[#a64df0]"></div>
		</div>
	</div>
</section>
