<script lang="ts">
	import { Database } from 'lucide-svelte';
	import { ListRoutePage } from '$lib/components/list-page';
</script>

<ListRoutePage
	toolbar={{
		searchPlaceholder: 'Search data sources...',
		searchAriaLabel: 'Search data sources',
		filterLabel: 'All types',
		actionLabel: 'Add data source'
	}}
	empty={{
		icon: Database,
		title: 'No data sources found',
		description: 'Connect data sources to power your opportunities.',
		nextSteps:
			'Overbase can analyze any of your internal data sources. Add the data sources you want us to use to send you actionable opportunities or that you want to share with your ecosystem partners',
		learnMoreLabel: 'Learn more',
		actionLabel: 'Add data source'
	}}
/>
