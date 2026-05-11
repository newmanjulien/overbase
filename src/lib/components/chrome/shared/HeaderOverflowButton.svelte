<script lang="ts">
	import { Ellipsis } from 'lucide-svelte';
	import { FloatingActionMenu, type FloatingActionMenuAction } from '$lib/components/ui';

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
	<button
		type="button"
		aria-label="More options"
		class="inline-flex size-7 items-center justify-center rounded-sm border border-zinc-200/60 bg-white text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300"
	>
		<Ellipsis class="size-3" />
	</button>
{/if}
