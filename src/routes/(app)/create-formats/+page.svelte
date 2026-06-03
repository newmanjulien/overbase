<script lang="ts">
	import { FormatStarterGalleryPage } from '$lib/features/format-starters/gallery';
	import FormatStarterCategorySelect from '$lib/features/format-starters/gallery/FormatStarterCategorySelect.svelte';
	import { useRouteTitleState } from '$lib/app/chrome/shared/route-title.svelte';
	import PageShell from '$lib/layout/PageShell.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const routeTitleState = useRouteTitleState();

	$effect(() => {
		routeTitleState.actions = headerCategorySelect;

		return () => {
			if (routeTitleState.actions === headerCategorySelect) {
				routeTitleState.actions = null;
			}
		};
	});
</script>

{#snippet headerCategorySelect()}
	<FormatStarterCategorySelect />
{/snippet}

<PageShell>
	<FormatStarterGalleryPage formatStarters={data.formatStarters} />
</PageShell>
