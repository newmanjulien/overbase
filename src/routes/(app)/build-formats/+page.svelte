<script lang="ts">
	import { BuilderGalleryPage } from '$lib/features/builder/gallery';
	import PageShell from '$lib/layout/PageShell.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<PageShell>
	<BuilderGalleryPage builders={data.builders} />
</PageShell>
