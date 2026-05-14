<script lang="ts">
	import { Button, SideModalShell } from '$lib/components/ui';

	type Props = {
		open: boolean;
		onClose: () => void;
	};

	let { open, onClose }: Props = $props();
</script>

<SideModalShell
	{open}
	title="Link data sources"
	subtitle="Choose the data sources this rule can reference"
	{onClose}
>
	{#snippet footer()}
		<Button variant="secondary" onclick={onClose}>Cancel</Button>
		<Button onclick={onClose}>Link data sources</Button>
	{/snippet}
</SideModalShell>
