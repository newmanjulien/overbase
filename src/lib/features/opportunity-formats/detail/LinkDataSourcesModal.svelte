<script lang="ts">
	import { Button, FullHeightModalShell } from '$lib/components/ui';

	type Props = {
		open: boolean;
		onClose: () => void;
	};

	let { open, onClose }: Props = $props();
</script>

<FullHeightModalShell
	{open}
	title="Link data sources"
	subtitle="Choose the data sources this rule can reference"
	placement="right"
	{onClose}
>
	{#snippet footer()}
		<Button variant="secondary" onclick={onClose}>Cancel</Button>
		<Button onclick={onClose}>Link data sources</Button>
	{/snippet}
</FullHeightModalShell>
