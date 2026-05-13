<script lang="ts">
	import { Button } from '$lib/components/ui';
	import BuilderAppCardArtwork from '$lib/features/builder/apps/artwork/BuilderAppCardArtwork.svelte';
	import type { BuilderAppRecord } from '$lib/features/builder/data';

	type Props = {
		app: BuilderAppRecord;
		onSelect: (appSlug: string) => void;
	};

	let { app, onSelect }: Props = $props();
</script>

<article
	class="group flex min-h-70 w-full flex-col rounded-lg border border-zinc-200/60 bg-white p-2 text-left transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-zinc-200"
>
	<div class="rounded-[0.45rem] bg-zinc-50 p-1">
		<BuilderAppCardArtwork artwork={app.artwork.card} />
	</div>

	<div class="flex min-h-0 flex-1 flex-col px-1.5 pt-3">
		<h2 class="truncate text-[0.9rem] font-medium tracking-normal text-zinc-950">
			{app.title}
		</h2>
		<p class="mt-1.5 line-clamp-2 text-[0.78rem] leading-snug text-zinc-500">
			{app.description}
		</p>
		<Button
			type="button"
			variant="secondary"
			class="mt-4 h-9 w-full rounded-md px-3.5 text-[0.76rem] focus-visible:shadow-[0_0_0_3px_rgb(24_24_27_/_18%)]"
			aria-label={`Start with ${app.title}`}
			onclick={() => {
				onSelect(app.id);
			}}
		>
			Create this notification
		</Button>
	</div>
</article>
