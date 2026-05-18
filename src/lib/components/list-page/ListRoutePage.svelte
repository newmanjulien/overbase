<script lang="ts">
	import type { Snippet } from 'svelte';
	import PageShell from '$lib/components/layout/PageShell.svelte';
	import EmptyListState from '$lib/components/list-page/EmptyListState.svelte';
	import EmptyListNextSteps from '$lib/components/list-page/EmptyListNextSteps.svelte';
	import ListPage from '$lib/components/list-page/ListPage.svelte';
	import ListToolbar from '$lib/components/list-page/ListToolbar.svelte';
	import type {
		EmptyListStateConfig,
		ListToolbarConfig
	} from '$lib/components/list-page/types';

	type Props = {
		toolbar: ListToolbarConfig;
		empty: EmptyListStateConfig;
		hasItems?: boolean;
		class?: string;
		contentClass?: string;
		children?: Snippet;
		footer?: Snippet;
	};

	let {
		toolbar: toolbarConfig,
		empty,
		hasItems = false,
		class: className = '',
		contentClass = '',
		children,
		footer: footerContent
	}: Props = $props();
</script>

<PageShell>
	<ListPage class={className} {contentClass}>
		{#snippet toolbar()}
			<ListToolbar {...toolbarConfig} />
		{/snippet}

		{#if hasItems}
			{@render children?.()}
		{:else}
			<EmptyListState {...empty} />
		{/if}

		{#snippet footer()}
			{#if !hasItems && empty.nextSteps}
				<EmptyListNextSteps message={empty.nextSteps} />
			{/if}
			{@render footerContent?.()}
		{/snippet}
	</ListPage>
</PageShell>
