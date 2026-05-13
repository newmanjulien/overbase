<script lang="ts">
	import BuilderAppGallery from '$lib/features/builder/home/BuilderAppGallery.svelte';
	import BuilderPromptEntry from './BuilderPromptEntry.svelte';
	import type { BuilderAppHomeData } from '$lib/features/builder/catalog';

	type Props = {
		builderHome: BuilderAppHomeData;
	};

	let { builderHome }: Props = $props();
</script>

<div class="mx-auto flex min-h-full w-full max-w-172 flex-col items-center pb-12">
	<div class="w-full max-w-172 pt-[clamp(6.5rem,22vh,13rem)]">
		<BuilderPromptEntry />
	</div>

	<p class="mt-0 max-w-164 text-center text-[0.76rem] leading-relaxed text-zinc-500 md:text-[0.8rem]">
		Overbase analyzes your data, analyzes data from your partners then sends actionable opportunities by email. This format builder lets you design the emails your team receives
	</p>

	<div class="mt-16 w-full">
		<BuilderAppGallery {builderHome} />
	</div>
</div>
