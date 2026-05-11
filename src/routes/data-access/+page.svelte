<script lang="ts">
	import { KeyRound } from 'lucide-svelte';
	import { ListRoutePage } from '$lib/components/list-page';
</script>

<ListRoutePage
	toolbar={{
		searchPlaceholder: 'Search data access...',
		searchAriaLabel: 'Search data access',
		filterLabel: 'All access'
	}}
	empty={{
		icon: KeyRound,
		title: 'No data access found',
		description: 'Control ecosystem access to shared data.',
		details:
			'Data access defines which partners and teams can use shared ecosystem context. Use this area to review access relationships, understand what data is available across connected organizations, and maintain the boundaries that support shared notifications.',
		learnMoreLabel: 'Learn more'
	}}
/>
