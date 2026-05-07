<script lang="ts">
	import { Database } from 'lucide-svelte';
	import { EmptyListPage } from '$lib/components/list-page';
	import PageShell from '$lib/components/layout/PageShell.svelte';
</script>

<PageShell>
	<EmptyListPage
		toolbar={{
			searchPlaceholder: 'Search data sources...',
			searchAriaLabel: 'Search data sources',
			filterLabel: 'All types',
			actionLabel: 'Add data source'
		}}
		empty={{
			icon: Database,
			title: 'No data sources found',
			description: 'Connect data sources to power your notifications.',
			details:
				'Data sources are the systems Overbase reads from when building notifications. Connect the tools that hold your operational data, then use them to create alerts that reflect the real activity happening across your team and partner ecosystem.',
			learnMoreLabel: 'Learn more',
			actionLabel: 'Add data source'
		}}
	/>
</PageShell>
