<script lang="ts">
	import ResourceEmptyState from '$lib/resource-index/ResourceEmptyState.svelte';
	import ResourceIndex from '$lib/resource-index/ResourceIndex.svelte';
	import ResourceToolbar from '$lib/resource-index/ResourceToolbar.svelte';
	import type {
		ResourceEmptyStateConfig,
		ResourceToolbarConfig
	} from '$lib/resource-index/types';

	type Props = {
		toolbar: ResourceToolbarConfig;
		empty: ResourceEmptyStateConfig;
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

<ResourceIndex class={className} {contentClass}>
	{#snippet toolbar()}
		<ResourceToolbar {...toolbarConfig} />
	{/snippet}

	<ResourceEmptyState
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
</ResourceIndex>
