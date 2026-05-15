<script lang="ts">
	import DotsThree from 'phosphor-svelte/lib/DotsThree';
	import { FloatingActionMenu, IconButton, type FloatingActionMenuAction } from '$lib/components/ui';

	type Props = {
		actions?: FloatingActionMenuAction[];
	};

	let { actions = [] }: Props = $props();
	let open = $state(false);
</script>

{#if actions.length > 0}
	<FloatingActionMenu
		id="header-overflow-actions"
		ariaLabel="More options"
		{actions}
		bind:open
		triggerClass="border border-zinc-200/60 bg-white hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300"
	/>
{:else}
	<IconButton
		aria-label="More options"
		variant="secondary"
		class="size-7 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300"
	>
		<DotsThree size={13} weight="bold" />
	</IconButton>
{/if}
