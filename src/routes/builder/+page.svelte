<script lang="ts">
	import BuilderDesktopOnly from '$lib/features/builder/canvas/BuilderDesktopOnly.svelte';
	import PageShell from '$lib/components/layout/PageShell.svelte';
	import BuilderStart from '$lib/features/builder/start/BuilderStart.svelte';
</script>

<PageShell>
	<BuilderDesktopOnly>
		<BuilderStart />
	</BuilderDesktopOnly>
</PageShell>
