<script lang="ts">
	import { ListRoutePage } from '$lib/components/list-page';
	import { APP_ROUTE_REGISTRY } from '$lib/app/app-routes';
	import AddDataSourceModal from '$lib/features/data-sources/AddDataSourceModal.svelte';

	let modalOpen = $state(false);
</script>

<ListRoutePage
	toolbar={{
		searchPlaceholder: 'Search data sources...',
		searchAriaLabel: 'Search data sources',
		filter: { label: 'All types', selectedId: 'all', options: [{ id: 'all', label: 'All types' }], onSelect: () => {} },
		actionLabel: 'Add data source',
		onAction: () => (modalOpen = true)
	}}
	empty={{
		icon: APP_ROUTE_REGISTRY['data-sources'].icon,
		title: 'No data sources found',
		description: 'Connect data sources to power your opportunities.',
		nextSteps:
			'Overbase can analyze any of your internal data sources. Add the data sources you want us to use to send you actionable opportunities or that you want to share with your ecosystem partners',
		learnMoreLabel: 'Learn more',
		actionLabel: 'Add data source',
		onAction: () => (modalOpen = true)
	}}
/>

<AddDataSourceModal open={modalOpen} onClose={() => (modalOpen = false)} />
