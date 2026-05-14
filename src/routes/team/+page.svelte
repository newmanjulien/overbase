<script lang="ts">
	import { ListRoutePage } from '$lib/components/list-page';
	import { Button, ModalShell } from '$lib/components/ui';
	import { APP_ROUTE_REGISTRY } from '$lib/app/app-routes';

	let modalOpen = $state(false);
</script>

<ListRoutePage
	toolbar={{
		searchPlaceholder: 'Search team...',
		searchAriaLabel: 'Search team',
		filterLabel: 'All roles',
		actionLabel: 'Invite team'
	}}
	empty={{
		icon: APP_ROUTE_REGISTRY.team.icon,
		title: 'No teammates found',
		description: 'Invite teammates who will receive opportunities.',
		nextSteps:
			'Teammates are the people inside your organization who receive opportunities. Invite teammates here, then add them to the right formats',
		learnMoreLabel: 'Learn more',
		actionLabel: 'Invite team',
		onAction: () => {
			modalOpen = true;
		}
	}}
/>

<ModalShell open={modalOpen} title="Invite team" onClose={() => (modalOpen = false)}>
	{#snippet footer()}
		<Button variant="secondary" onclick={() => (modalOpen = false)}>Cancel</Button>
		<Button onclick={() => (modalOpen = false)}>Invite team</Button>
	{/snippet}
</ModalShell>
