<script lang="ts">
	import { ContactRound } from 'lucide-svelte';
	import { ListRoutePage } from '$lib/components/list-page';
</script>

<ListRoutePage
	toolbar={{
		searchPlaceholder: 'Search team...',
		searchAriaLabel: 'Search team',
		filterLabel: 'All roles',
		actionLabel: 'Invite team'
	}}
	empty={{
		icon: ContactRound,
		title: 'No teammates found',
		description: 'Invite teammates who will receive notifications.',
		nextSteps:
			'Teammates are the people inside your organization who receive notifications. Invite teammates here, then add them to the right notifications',
		learnMoreLabel: 'Learn more',
		actionLabel: 'Invite team'
	}}
/>
