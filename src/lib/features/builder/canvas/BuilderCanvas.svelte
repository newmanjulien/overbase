<script lang="ts">
	import { CUSTOM_EMAIL_BUILDER_BLUEPRINT_ID } from '$lib/features/builder/domain/email-design';
	import type { BuilderBlueprintRecord } from '$lib/features/builder/data';
	import CustomEmailBuilderWorkbench from '$lib/features/builder/canvas/CustomEmailBuilderWorkbench.svelte';
	import BlueprintBuilderWorkbench from '$lib/features/builder/canvas/BlueprintBuilderWorkbench.svelte';
	import type { BuilderGuideDefinition } from '$lib/features/builder/guide/guide-types';

	type Props = {
		blueprint: BuilderBlueprintRecord;
		guide: BuilderGuideDefinition | null;
		initialMessage?: string | null;
		activeConversation?: unknown;
	};

	let { blueprint, guide, initialMessage = null, activeConversation = null }: Props = $props();
	const isCustomEmailBuilder = $derived(blueprint.id === CUSTOM_EMAIL_BUILDER_BLUEPRINT_ID);
</script>

{#if isCustomEmailBuilder}
	<CustomEmailBuilderWorkbench {blueprint} {initialMessage} />
{:else}
	<BlueprintBuilderWorkbench {blueprint} {guide} {initialMessage} {activeConversation} />
{/if}
