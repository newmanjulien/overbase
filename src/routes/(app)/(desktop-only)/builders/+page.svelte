<script lang="ts">
	import PageShell from '$lib/layout/PageShell.svelte';
	import BuilderHomePage from '$lib/features/builder/home/BuilderHomePage.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<PageShell>
	<BuilderHomePage builderHome={data.builderHome} />
</PageShell>
