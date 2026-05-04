<script lang="ts">
	import { Users } from 'lucide-svelte';
	import { ResourceEmptyIndex } from '$lib/resource-index';
	import SurfaceShell from '$lib/surface/SurfaceShell.svelte';
</script>

<SurfaceShell>
	<ResourceEmptyIndex
		toolbar={{
			searchPlaceholder: 'Search team members...',
			searchAriaLabel: 'Search team members',
			filterLabel: 'All roles',
			actionLabel: 'Invite member'
		}}
		empty={{
			icon: Users,
			title: 'No team members found',
			description: 'Invite teammates to build and manage notifications together.',
			details:
				'Team members are the people inside your organization who help create notifications, manage data sources, and keep shared workflows moving. Add teammates here to coordinate operational updates across your internal team.',
			learnMoreLabel: 'Learn more',
			actionLabel: 'Invite member'
		}}
	/>
</SurfaceShell>
