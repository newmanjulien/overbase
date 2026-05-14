<script lang="ts">
	import { UserPlus } from 'lucide-svelte';
	import { ListRoutePage } from '$lib/components/list-page';
	import { Button, ModalShell } from '$lib/components/ui';

	let modalOpen = $state(false);
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
		actionLabel: 'Invite partner',
		onAction: () => {
			modalOpen = true;
		}
	}}
/>

<ModalShell open={modalOpen} title="Invite partner" onClose={() => (modalOpen = false)}>
	{#snippet footer()}
		<Button variant="secondary" onclick={() => (modalOpen = false)}>Cancel</Button>
		<Button onclick={() => (modalOpen = false)}>Invite partner</Button>
	{/snippet}
</ModalShell>
