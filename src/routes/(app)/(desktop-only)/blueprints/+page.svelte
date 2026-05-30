<script lang="ts">
	import { BlueprintGalleryPage } from '$lib/features/blueprints/gallery';
	import PageShell from '$lib/layout/PageShell.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<PageShell>
	<BlueprintGalleryPage blueprints={data.blueprints} />
</PageShell>
