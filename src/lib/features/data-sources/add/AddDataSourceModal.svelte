<script lang="ts">
	import { Button, FullHeightModalShell } from '$lib/components/ui';
	import AddDataSourceModalBody from './AddDataSourceModalBody.svelte';

	type Props = {
		open: boolean;
		onClose: () => void;
	};

	let { open, onClose }: Props = $props();
</script>

<FullHeightModalShell
	{open}
	title="Add data source"
	subtitle="Connect a source once, then use it across opportunity formats and partner workflows."
	placement="center"
	{onClose}
>
	<AddDataSourceModalBody />

	{#snippet footer()}
		<Button class="ml-auto" onclick={onClose}>Add data source</Button>
	{/snippet}
</FullHeightModalShell>
