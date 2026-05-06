<script lang="ts">
	import { CUSTOM_EMAIL_BUILDER_CARD_ID } from '$lib/builder-domain/email';
	import type { BuilderCardRecord } from '$lib/features/builder-data';
	import CustomEmailBuilderWorkbench from '$lib/features/builder-canvas/CustomEmailBuilderWorkbench.svelte';
	import TemplateBuilderWorkbench from '$lib/features/builder-canvas/TemplateBuilderWorkbench.svelte';
	import type { BuilderGuideDefinition } from '$lib/features/builder-guide/guide-types';

	type Props = {
		card: BuilderCardRecord;
		guide: BuilderGuideDefinition | null;
		initialMessage?: string | null;
		activeConversation?: unknown;
	};

	let { card, guide, initialMessage = null, activeConversation = null }: Props = $props();
	const isCustomEmailBuilder = $derived(card.id === CUSTOM_EMAIL_BUILDER_CARD_ID);
</script>

{#if isCustomEmailBuilder}
	<CustomEmailBuilderWorkbench {card} {initialMessage} />
{:else}
	<TemplateBuilderWorkbench {card} {guide} {initialMessage} {activeConversation} />
{/if}
