<script lang="ts">
	import { APP_LINKS } from '$lib/app/app-links';
	import { FormatCreatorPage } from '$lib/features/format-starters/creator';
	import PageShell from '$lib/layout/PageShell.svelte';
	import { Button } from '$lib/ui';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<PageShell class="px-0 py-0 md:px-0 md:py-0">
	{#if data.formatStarter}
		<FormatCreatorPage formatStarter={data.formatStarter} />
	{:else}
		<div class="flex h-full min-h-full items-center justify-center bg-white px-6 py-12">
			<div class="w-full max-w-sm rounded-sm border border-stone-200 bg-white p-5 text-center shadow-sm">
				<p class="text-sm font-medium text-stone-950">Format not found</p>
				<p class="mt-2 text-xs leading-relaxed text-stone-500">
					Choose a format from the gallery to start a local draft.
				</p>
				<Button variant="primary" href={APP_LINKS.createFormats.pathname} class="mt-4 rounded-full text-xs">
					Back to create formats
				</Button>
			</div>
		</div>
	{/if}
</PageShell>
