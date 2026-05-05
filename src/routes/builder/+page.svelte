<script lang="ts">
	import BuilderDesktopOnly from '$lib/features/builder-canvas/BuilderDesktopOnly.svelte';
	import SurfaceShell from '$lib/surface/SurfaceShell.svelte';
	import BuilderStart from '$lib/features/builder-start/BuilderStart.svelte';
</script>

<SurfaceShell>
	<BuilderDesktopOnly>
		<BuilderStart />
	</BuilderDesktopOnly>
</SurfaceShell>
