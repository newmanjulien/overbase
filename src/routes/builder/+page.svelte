<script lang="ts">
	import BuilderDesktopOnly from '$lib/features/builder/workbench/BuilderDesktopOnly.svelte';
	import PageShell from '$lib/components/layout/PageShell.svelte';
	import BuilderHomePage from '$lib/features/builder/home/BuilderHomePage.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<PageShell>
	<BuilderDesktopOnly>
		<BuilderHomePage builderHome={data.builderHome} />
	</BuilderDesktopOnly>
</PageShell>
