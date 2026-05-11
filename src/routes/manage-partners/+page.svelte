<script lang="ts">
	import { UsersRound } from 'lucide-svelte';
	import { ListRoutePage } from '$lib/components/list-page';
</script>

<ListRoutePage
	toolbar={{
		searchPlaceholder: 'Search partners...',
		searchAriaLabel: 'Search partners',
		filterLabel: 'All partners'
	}}
	empty={{
		icon: UsersRound,
		title: 'No partners found',
		description: 'Manage partners connected to your ecosystem.',
		nextSteps: [
			{ kind: 'link', text: 'Invite', href: '/invite-partners' },
			{
				kind: 'text',
				text: ' your ecosystem partners so you can share sales data with them. You will be able to use their data in your notifications and they will be able to use your data in a secure way that you control'
			}
		],
		learnMoreLabel: 'Learn more'
	}}
/>
