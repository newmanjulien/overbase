<script lang="ts">
	import { UserPlus } from 'lucide-svelte';
	import { ResourceEmptyIndex } from '$lib/resource-index';
	import SurfaceShell from '$lib/surface/SurfaceShell.svelte';
</script>

<SurfaceShell>
	<ResourceEmptyIndex
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
			details:
				'Partner invitations let you bring external teams into the workflows that depend on shared context. Once invited, partners can participate in the ecosystem data flows that help Overbase produce more relevant notifications and operational updates.',
			learnMoreLabel: 'Learn more',
			actionLabel: 'Invite partner'
		}}
	/>
</SurfaceShell>
