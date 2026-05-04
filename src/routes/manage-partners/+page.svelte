<script lang="ts">
	import { UsersRound } from 'lucide-svelte';
	import { ResourceEmptyIndex } from '$lib/resource-index';
	import SurfaceShell from '$lib/surface/SurfaceShell.svelte';
</script>

<SurfaceShell>
	<ResourceEmptyIndex
		toolbar={{
			searchPlaceholder: 'Search partners...',
			searchAriaLabel: 'Search partners',
			filterLabel: 'All partners'
		}}
		empty={{
			icon: UsersRound,
			title: 'No partners found',
			description: 'Manage partners connected to your ecosystem.',
			details:
				'Partners represent the external organizations connected to your team. Use this area to keep track of who is part of your ecosystem, understand which relationships are active, and maintain the partner network that supports shared notifications.',
			learnMoreLabel: 'Learn more'
		}}
	/>
</SurfaceShell>
