<script lang="ts">
	import type { Snippet } from 'svelte';
	import PageShell from '$lib/components/layout/PageShell.svelte';
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
		hasItems?: boolean;
		class?: string;
		contentClass?: string;
		children?: Snippet;
	};

	let {
		toolbar: toolbarConfig,
		empty,
		hasItems = false,
		class: className = '',
		contentClass = '',
		children
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
			<EmptyListState
				icon={empty.icon}
				title={empty.title}
				description={empty.description}
				learnMoreLabel={empty.learnMoreLabel}
				actionLabel={empty.actionLabel}
			/>
		{/if}

		{#snippet footer()}
			{#if !hasItems && empty.details}
				<aside
					class="w-full rounded-[0.45rem] border border-blue-100/60 bg-blue-50/30 px-4 py-3 text-[0.76rem] leading-relaxed text-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
				>
					<span class="font-semibold text-zinc-950">Next steps:</span>
					<span class="ml-1">{empty.details}</span>
				</aside>
			{/if}
		{/snippet}
	</ListPage>
</PageShell>
