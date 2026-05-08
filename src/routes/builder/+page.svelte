<script lang="ts">
	import BuilderDesktopOnly from '$lib/features/builder/canvas/BuilderDesktopOnly.svelte';
	import PageShell from '$lib/components/layout/PageShell.svelte';
	import BuilderStart from '$lib/features/builder/start/BuilderStart.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<PageShell>
	<BuilderDesktopOnly>
		<BuilderStart builderHome={data.builderHome} />
	</BuilderDesktopOnly>
</PageShell>
