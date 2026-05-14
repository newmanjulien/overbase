<script lang="ts">
	import { Globe } from 'lucide-svelte';
	import { ListRoutePage } from '$lib/components/list-page';
	import { Button, ModalShell } from '$lib/components/ui';

	let modalOpen = $state(false);
</script>

<ListRoutePage
	toolbar={{
		searchPlaceholder: 'Search external data...',
		searchAriaLabel: 'Search external data',
		filterLabel: 'All types',
		actionLabel: 'Add external data'
	}}
	empty={{
		icon: Globe,
		title: 'No external data found',
		description: 'Connect external data to enrich your opportunities.',
		nextSteps:
			'Overbase can pull from any external APIs or data sources you purchase. Connect external sources, then use them to power your opportunities',
		learnMoreLabel: 'Learn more',
		actionLabel: 'Add external data',
		onAction: () => {
			modalOpen = true;
		}
	}}
/>

<ModalShell open={modalOpen} title="Add external data" onClose={() => (modalOpen = false)}>
	{#snippet footer()}
		<Button variant="secondary" onclick={() => (modalOpen = false)}>Cancel</Button>
		<Button onclick={() => (modalOpen = false)}>Add external data</Button>
	{/snippet}
</ModalShell>
