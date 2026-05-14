<script lang="ts">
	import { ListRoutePage } from '$lib/components/list-page';
	import { Button, ModalShell } from '$lib/components/ui';
	import { APP_ROUTE_REGISTRY } from '$lib/app/app-routes';

	let modalOpen = $state(false);
</script>

<ListRoutePage
	toolbar={{
		searchPlaceholder: 'Search data sources...',
		searchAriaLabel: 'Search data sources',
		filterLabel: 'All types',
		actionLabel: 'Add data source'
	}}
	empty={{
		icon: APP_ROUTE_REGISTRY['data-sources'].icon,
		title: 'No data sources found',
		description: 'Connect data sources to power your opportunities.',
		nextSteps:
			'Overbase can analyze any of your internal data sources. Add the data sources you want us to use to send you actionable opportunities or that you want to share with your ecosystem partners',
		learnMoreLabel: 'Learn more',
		actionLabel: 'Add data source',
		onAction: () => {
			modalOpen = true;
		}
	}}
/>

<ModalShell open={modalOpen} title="Add data source" onClose={() => (modalOpen = false)}>
	{#snippet footer()}
		<Button variant="secondary" onclick={() => (modalOpen = false)}>Cancel</Button>
		<Button onclick={() => (modalOpen = false)}>Add data source</Button>
	{/snippet}
</ModalShell>
