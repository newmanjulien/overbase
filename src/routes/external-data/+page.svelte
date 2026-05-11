<script lang="ts">
	import { Globe2 } from 'lucide-svelte';
	import { ListRoutePage } from '$lib/components/list-page';
</script>

<ListRoutePage
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
			'Overbase can pull from any external APIs or data sources you purchase. Connect external sources, then use them to power your notifications',
		learnMoreLabel: 'Learn more',
		actionLabel: 'Add external data'
	}}
/>
