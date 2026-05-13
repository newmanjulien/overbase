<script lang="ts">
	import { Button, ModalShell } from '$lib/components/ui';

	type Props = {
		open: boolean;
		onClose: () => void;
	};

	let { open, onClose }: Props = $props();
</script>

<ModalShell {open} title="Link data sources" {onClose}>
	{#snippet footer()}
		<Button variant="secondary" class="h-9 px-4 text-[0.82rem]" onclick={onClose}>Cancel</Button>
		<Button class="h-9 px-4 text-[0.82rem]" onclick={onClose}>Link data sources</Button>
	{/snippet}
</ModalShell>
