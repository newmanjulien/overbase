<script lang="ts">
	import { APP_ROUTE_REGISTRY } from '$lib/app/app-routes';
	import { ListRoutePage } from '$lib/components/list-page';
</script>

<ListRoutePage
	toolbar={{
		searchPlaceholder: 'Search team formats...',
		searchAriaLabel: 'Search team formats',
		filterLabel: 'All teammates'
	}}
	empty={{
		icon: APP_ROUTE_REGISTRY['team-formats'].icon,
		title: 'No team formats found',
		description: 'Manage the opportunity formats that your team created for themselves.',
		learnMoreLabel: 'Learn more'
	}}
/>
