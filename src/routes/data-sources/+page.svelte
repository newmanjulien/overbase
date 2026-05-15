<script lang="ts">
	import { ListRoutePage } from '$lib/components/list-page';
	import { APP_ROUTE_REGISTRY } from '$lib/app/app-routes';
	import { AddDataSourceModal } from '$lib/features/data-sources/add';

	let modalOpen = $state(false);

	function openModal() {
		modalOpen = true;
	}
</script>

<ListRoutePage
	toolbar={{
		searchPlaceholder: 'Search data sources...',
		searchAriaLabel: 'Search data sources',
		filterLabel: 'All types',
		actionLabel: 'Add data source',
		onAction: openModal
	}}
	empty={{
		icon: APP_ROUTE_REGISTRY['data-sources'].icon,
		title: 'No data sources found',
		description: 'Connect data sources to power your opportunities.',
		nextSteps:
			'Overbase can analyze any of your internal data sources. Add the data sources you want us to use to send you actionable opportunities or that you want to share with your ecosystem partners',
		learnMoreLabel: 'Learn more',
		actionLabel: 'Add data source',
		onAction: openModal
	}}
/>

<AddDataSourceModal open={modalOpen} onClose={() => (modalOpen = false)} />
