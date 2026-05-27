<script lang="ts">
	import { APP_ROUTE_REGISTRY } from '$lib/app/app-routes';
	import { ListRoutePage } from '$lib/patterns/list-page';
	import { InfoBar } from '$lib/ui';
</script>

<ListRoutePage
	toolbar={{
		searchPlaceholder: 'Search team email formats...',
		searchAriaLabel: 'Search team email formats',
		filter: { label: 'All teammates', selectedId: 'all', options: [{ id: 'all', label: 'All teammates' }], onSelect: () => {} }
	}}
	empty={{
		icon: APP_ROUTE_REGISTRY['team-email-formats'].icon,
		title: 'No team email formats found',
		description: 'Manage the email formats that your team created for themselves.',
		learnMoreLabel: 'Learn more'
	}}
>
	{#snippet footer()}
		<InfoBar label="Next steps:">
			Ask your team to build their own email formats and manage them here
		</InfoBar>
	{/snippet}
</ListRoutePage>
