<script lang="ts">
	import type { BuilderCardRecord } from '$lib/features/builder-data';
	import BuilderGuideFlow from '$lib/features/builder-guide/BuilderGuideFlow.svelte';
	import BuilderPromptComposer from '$lib/features/builder-guide/BuilderPromptComposer.svelte';
	import { getBuilderGuideDefinition } from '$lib/features/builder-data';

	type Props = {
		card: BuilderCardRecord;
	};

	type BuilderGuideMessage = {
		id: number;
		text: string;
	};

	let { card }: Props = $props();
	let submittedMessages = $state<BuilderGuideMessage[]>([]);
	let nextMessageId = 1;
	const guide = $derived(getBuilderGuideDefinition(card.id));

	function handlePromptSubmit(message: string) {
		submittedMessages = [...submittedMessages, { id: nextMessageId, text: message }];
		nextMessageId += 1;
	}
</script>

<section class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white p-2">
	<div class="min-h-0 flex-1 overflow-y-auto px-3 py-6 md:px-5 md:py-8">
		<div class="ml-auto w-fit max-w-[80%] rounded-full bg-zinc-100 px-4 py-2 text-sm text-zinc-800">
			Help me get started with this notification
		</div>

		<div class="mt-12 max-w-3xl md:mt-16">
			<p class="text-sm leading-relaxed text-zinc-800">
				{guide.intro}
			</p>
		</div>

		<BuilderGuideFlow {guide} />

		{#each submittedMessages as message (message.id)}
			<div class="mt-6 ml-auto w-fit max-w-[80%] rounded-full bg-zinc-100 px-4 py-2 text-sm text-zinc-800">
				{message.text}
			</div>
		{/each}
	</div>

	<BuilderPromptComposer onSubmit={handlePromptSubmit} />
</section>
