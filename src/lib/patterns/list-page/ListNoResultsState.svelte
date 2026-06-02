<script lang="ts">
	import type { NonLinkInlineTextContent } from '$lib/domain/inline-text';
	import EmptyListState from './EmptyListState.svelte';
	import type { EmptyListStateConfig } from './types';

	type Props = {
		empty: EmptyListStateConfig;
		title: string;
		description: NonLinkInlineTextContent;
		class?: string;
	};

	let { empty, title, description, class: className = '' }: Props = $props();
</script>

<EmptyListState icon={empty.icon} {title} {description} class={className} />
