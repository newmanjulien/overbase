<script lang="ts">
	import { ContactRound } from 'lucide-svelte';
	import { EmptyListPage } from '$lib/components/list-page';
	import PageShell from '$lib/components/layout/PageShell.svelte';
</script>

<PageShell>
	<EmptyListPage
		toolbar={{
			searchPlaceholder: 'Search team members...',
			searchAriaLabel: 'Search team members',
			filterLabel: 'All roles',
			actionLabel: 'Invite member'
		}}
		empty={{
			icon: ContactRound,
			title: 'No team members found',
			description: 'Invite teammates to build and manage notifications together.',
			details:
				'Team members are the people inside your organization who help create notifications, manage data sources, and keep shared workflows moving. Add teammates here to coordinate operational updates across your internal team.',
			learnMoreLabel: 'Learn more',
			actionLabel: 'Invite member'
		}}
	/>
</PageShell>
