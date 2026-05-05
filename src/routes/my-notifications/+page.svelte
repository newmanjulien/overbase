<script lang="ts">
	import { Bell } from 'lucide-svelte';
	import { ResourceEmptyIndex } from '$lib/resource-index';
	import SurfaceShell from '$lib/surface/SurfaceShell.svelte';
</script>

<SurfaceShell>
	<ResourceEmptyIndex
		toolbar={{
			searchPlaceholder: 'Search notifications...',
			searchAriaLabel: 'Search notifications',
			filterLabel: 'All notifications'
		}}
		empty={{
			icon: Bell,
			title: 'No notifications found',
			description: 'Build notifications to track the updates that matter to you.',
			details:
				'My notifications is where your active notification workflows will appear. Build notifications that monitor the data sources and partner activity your team relies on, then manage the updates you receive from this view.',
			learnMoreLabel: 'Learn more'
		}}
	/>
</SurfaceShell>
