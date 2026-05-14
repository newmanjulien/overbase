<script lang="ts">
	import { ListRoutePage } from '$lib/components/list-page';
	import { APP_ROUTE_REGISTRY } from '$lib/app/app-routes';
</script>

<ListRoutePage
	toolbar={{
		searchPlaceholder: 'Search partners...',
		searchAriaLabel: 'Search partners',
		filterLabel: 'All partners'
	}}
	empty={{
		icon: APP_ROUTE_REGISTRY['data-access'].icon,
		title: 'No partners found',
		description: 'Control what data you share with each partner.',
		nextSteps: [
			{ kind: 'link', text: 'Invite', href: '/invite-partners' },
			{
				kind: 'text',
				text: ' your ecosystem partners then control what data they can access in a granular and secure way'
			}
		],
		learnMoreLabel: 'Learn more'
	}}
/>
