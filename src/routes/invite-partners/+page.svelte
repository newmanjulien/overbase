<script lang="ts">
	import { UserPlus } from 'lucide-svelte';
	import { ListRoutePage } from '$lib/components/list-page';
</script>

<ListRoutePage
	toolbar={{
		searchPlaceholder: 'Search invitations...',
		searchAriaLabel: 'Search invitations',
		filterLabel: 'All statuses',
		actionLabel: 'Invite partner'
	}}
	empty={{
		icon: UserPlus,
		title: 'No invitations found',
		description: 'Invite ecosystem partners to share data and collaborate.',
		nextSteps:
			'Invite your ecosystem partners so you can share sales data with them. You will be able to use their data in your opportunities and they will be able to use your data in a secure way that you control',
		learnMoreLabel: 'Learn more',
		actionLabel: 'Invite partner'
	}}
/>
