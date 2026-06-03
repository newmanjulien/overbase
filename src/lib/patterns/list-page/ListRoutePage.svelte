<script lang="ts">
	import type { Snippet } from 'svelte';
	import PageShell from '$lib/layout/PageShell.svelte';
	import EmptyListState from '$lib/patterns/list-page/EmptyListState.svelte';
	import EmptyListNextSteps from '$lib/patterns/list-page/EmptyListNextSteps.svelte';
	import ListContentState from '$lib/patterns/list-page/ListContentState.svelte';
	import ListPage from '$lib/patterns/list-page/ListPage.svelte';
	import ListNoResultsState from '$lib/patterns/list-page/ListNoResultsState.svelte';
	import ListToolbar from '$lib/patterns/list-page/ListToolbar.svelte';
	import type {
		EmptyListStateConfig,
		ListRouteStatus,
		ListToolbarConfig,
		NoResultsListStateConfig
	} from '$lib/patterns/list-page/types';

	type ListRouteContentState = 'loading' | 'error' | 'empty' | 'noResults' | 'records';

	type Props = {
		toolbar: ListToolbarConfig;
		empty: EmptyListStateConfig;
		noResults: NoResultsListStateConfig;
		status: ListRouteStatus;
		totalRecords: number;
		visibleRecords: number;
		isQueryActive: boolean;
		loadingMessage?: string;
		errorMessage?: string;
		class?: string;
		contentClass?: string;
		contentHeader?: Snippet;
		children?: Snippet;
		footer?: Snippet;
	};

	let {
		toolbar: toolbarConfig,
		empty,
		noResults,
		status,
		totalRecords,
		visibleRecords,
		isQueryActive,
		loadingMessage = 'Loading...',
		errorMessage = 'Could not load records.',
		class: className = '',
		contentClass = '',
		contentHeader,
		children,
		footer: footerContent
	}: Props = $props();

	const hasActualRecords = $derived(totalRecords > 0);
	const contentState = $derived.by<ListRouteContentState>(() => {
		if (status === 'loading') {
			return 'loading';
		}

		if (status === 'error') {
			return 'error';
		}

		if (totalRecords === 0 && !isQueryActive) {
			return 'empty';
		}

		if (visibleRecords === 0) {
			return 'noResults';
		}

		return 'records';
	});
</script>

<PageShell>
	<ListPage class={className} {contentClass}>
		{#snippet toolbar()}
			<ListToolbar {...toolbarConfig} />
		{/snippet}

		{#if contentState === 'loading'}
			<ListContentState kind="loading" message={loadingMessage} />
		{:else if contentState === 'error'}
			<ListContentState kind="error" message={errorMessage} />
		{:else if contentState === 'empty'}
			<EmptyListState {...empty} />
		{:else if contentState === 'noResults'}
			{#if hasActualRecords}
				{@render contentHeader?.()}
			{/if}
			<ListNoResultsState empty={empty} {...noResults} />
		{:else}
			{@render contentHeader?.()}
			{@render children?.()}
		{/if}

		{#snippet footer()}
			{#if status === 'ready' && !hasActualRecords && empty.nextSteps}
				<EmptyListNextSteps message={empty.nextSteps} />
			{/if}
			{#if status === 'ready' && hasActualRecords}
				{@render footerContent?.()}
			{/if}
		{/snippet}
	</ListPage>
</PageShell>
