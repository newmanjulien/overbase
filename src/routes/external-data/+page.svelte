<script lang="ts">
	import { Globe2 } from 'lucide-svelte';
	import { ResourceEmptyIndex } from '$lib/resource-index';
	import SurfaceShell from '$lib/surface/SurfaceShell.svelte';
</script>

<SurfaceShell>
	<ResourceEmptyIndex
		toolbar={{
			searchPlaceholder: 'Search external data...',
			searchAriaLabel: 'Search external data',
			filterLabel: 'All types',
			actionLabel: 'Add external data'
		}}
		empty={{
			icon: Globe2,
			title: 'No external data found',
			description: 'Connect external data to enrich your notifications.',
			details:
				'External data includes the outside systems and shared datasets your team uses to add context to notifications. Connect external sources, then use them to build alerts that reflect activity beyond your internal tools.',
			learnMoreLabel: 'Learn more',
			actionLabel: 'Add external data'
		}}
	/>
</SurfaceShell>
