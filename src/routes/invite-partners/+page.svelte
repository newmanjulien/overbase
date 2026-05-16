<script lang="ts">
	import { ListRoutePage } from '$lib/components/list-page';
	import AddInvitePartnerModal from '$lib/features/invite-partners/AddInvitePartnerModal.svelte';
	import { APP_ROUTE_REGISTRY } from '$lib/app/app-routes';

	let modalOpen = $state(false);

	function openModal() {
		modalOpen = true;
	}
</script>

<ListRoutePage
	toolbar={{
		searchPlaceholder: 'Search invitations...',
		searchAriaLabel: 'Search invitations',
		filter: { label: 'All statuses', selectedId: 'all', options: [{ id: 'all', label: 'All statuses' }], onSelect: () => {} },
		actionLabel: 'Invite partners',
		onAction: openModal
	}}
	empty={{
		icon: APP_ROUTE_REGISTRY['invite-partners'].icon,
		title: 'No invitations found',
		description: 'Invite ecosystem partners to share data and collaborate.',
		nextSteps:
			'Invite your ecosystem partners so you can share sales data with them. You will be able to use their data in your opportunities and they will be able to use your data in a secure way that you control',
		learnMoreLabel: 'Learn more',
		actionLabel: 'Invite partners',
		onAction: openModal
	}}
/>

<AddInvitePartnerModal open={modalOpen} onClose={() => (modalOpen = false)} />
