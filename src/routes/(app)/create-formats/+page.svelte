<script lang="ts">
	import { FormatStarterGalleryPage } from '$lib/features/format-starters/gallery';
	import PageShell from '$lib/layout/PageShell.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<PageShell>
	<FormatStarterGalleryPage formatStarters={data.formatStarters} />
</PageShell>
