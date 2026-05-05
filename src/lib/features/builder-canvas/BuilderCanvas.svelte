<script lang="ts">
	import { resolve } from '$app/paths';
	import type { BuilderCardRecord } from '$lib/features/builder-data';
	import BuilderBlueprintPanel from '$lib/features/builder-canvas/BuilderBlueprintPanel.svelte';
	import BuilderChatPanel from '$lib/features/builder-chat/BuilderChatPanel.svelte';
	import BuilderSetupFlow from '$lib/features/builder-setup/BuilderSetupFlow.svelte';
	import type { BuilderGuideDefinition } from '$lib/features/builder-guide/guide-types';
	import SplitPane from '$lib/features/builder-canvas/SplitPane.svelte';
	import { BUILDER_CANVAS_SPLIT } from '$lib/features/builder-canvas/split-pane';

	type Props = {
		card: BuilderCardRecord;
		guide: BuilderGuideDefinition | null;
		initialMessage?: string | null;
	};

	let { card, guide, initialMessage = null }: Props = $props();
	let activeCardId = $state('');
	let activeInitialMessageKey = $state('');
	let mode = $state<'setup' | 'chat'>('setup');
	let chatInitialMessage = $state<string | null>(null);

	function startChat(initialMessage: string) {
		chatInitialMessage = initialMessage;
		mode = 'chat';
	}

	$effect(() => {
		const nextInitialMessage = initialMessage?.trim() ?? '';
		const nextInitialMessageKey = `${card.id}:${nextInitialMessage}`;

		if (nextInitialMessage) {
			if (activeInitialMessageKey === nextInitialMessageKey) {
				return;
			}

			activeCardId = card.id;
			activeInitialMessageKey = nextInitialMessageKey;
			startChat(nextInitialMessage);
			return;
		}

		if (activeCardId === card.id) {
			return;
		}

		activeCardId = card.id;
		activeInitialMessageKey = `${card.id}:`;
		chatInitialMessage = null;
		mode = 'setup';
	});
</script>

<SplitPane
	minPrimary={BUILDER_CANVAS_SPLIT.minPrimary}
	minSecondary={BUILDER_CANVAS_SPLIT.minSecondary}
	defaultRatio={BUILDER_CANVAS_SPLIT.defaultRatio}
	mobileBreakpoint={BUILDER_CANVAS_SPLIT.mobileBreakpoint}
	keyboardStep={BUILDER_CANVAS_SPLIT.keyboardStep}
	handleWidth={BUILDER_CANVAS_SPLIT.handleWidth}
	label="Resize builder panels"
>
	{#snippet primary()}
		{#if mode === 'chat' && chatInitialMessage}
			<BuilderChatPanel
				{card}
				initialMessage={chatInitialMessage}
			/>
		{:else if guide}
			<BuilderSetupFlow {card} {guide} onComplete={startChat} />
		{:else}
			<div class="flex h-full min-h-0 min-w-0 flex-col justify-center bg-white px-6">
				<div class="mx-auto max-w-sm text-center">
					<p class="text-[0.82rem] font-medium text-zinc-950">Start from the builder</p>
					<p class="mt-2 text-[0.72rem] leading-[1.5] text-zinc-500">
						Describe the notification you want from the builder screen to start a fresh chat.
					</p>
					<a
						href={resolve('/builder')}
						class="mt-4 inline-flex h-8 items-center justify-center rounded-full bg-zinc-950 px-3.5 text-[0.72rem] font-medium text-white transition-colors hover:bg-zinc-800"
					>
						Back to builder
					</a>
				</div>
			</div>
		{/if}
	{/snippet}

	{#snippet secondary()}
		<BuilderBlueprintPanel {card} />
	{/snippet}
</SplitPane>
