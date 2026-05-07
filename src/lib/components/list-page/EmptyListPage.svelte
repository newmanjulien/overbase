<script lang="ts">
	import EmptyListState from '$lib/components/list-page/EmptyListState.svelte';
	import ListPage from '$lib/components/list-page/ListPage.svelte';
	import ListToolbar from '$lib/components/list-page/ListToolbar.svelte';
	import type {
		EmptyListStateConfig,
		ListToolbarConfig
	} from '$lib/components/list-page/types';

	type Props = {
		toolbar: ListToolbarConfig;
		empty: EmptyListStateConfig;
		class?: string;
		contentClass?: string;
	};

	let {
		toolbar: toolbarConfig,
		empty: emptyConfig,
		class: className = '',
		contentClass = ''
	}: Props = $props();
</script>

<ListPage class={className} {contentClass}>
	{#snippet toolbar()}
		<ListToolbar {...toolbarConfig} />
	{/snippet}

	<EmptyListState
		icon={emptyConfig.icon}
		title={emptyConfig.title}
		description={emptyConfig.description}
		learnMoreLabel={emptyConfig.learnMoreLabel}
		actionLabel={emptyConfig.actionLabel}
	/>

	{#snippet footer()}
		{#if emptyConfig.details}
			<p class="w-full text-center text-[0.7rem] leading-relaxed text-zinc-500 md:text-[0.72rem]">
				{emptyConfig.details}
			</p>
		{/if}
	{/snippet}
</ListPage>
