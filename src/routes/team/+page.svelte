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
		details:
			'Teammates are the people inside your organization who help create notifications, manage data sources, and keep shared workflows moving. Add teammates here to coordinate operational updates across your internal team.',
		learnMoreLabel: 'Learn more',
		actionLabel: 'Invite team'
	}}
/>
