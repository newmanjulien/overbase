<script lang="ts">
	import { beforeNavigate, replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { BuilderBlueprintRecord } from '$lib/features/builder-data';
	import BuilderBlueprintPanel from '$lib/features/builder-canvas/BuilderBlueprintPanel.svelte';
	import SplitPane from '$lib/features/builder-canvas/SplitPane.svelte';
	import { BUILDER_CANVAS_SPLIT } from '$lib/features/builder-canvas/split-pane';
	import BuilderChatPanel from '$lib/features/builder-chat/BuilderChatPanel.svelte';
	import {
		createBuilderConversationController,
		parseBuilderConversationHandle,
		type BuilderConversationHandle
	} from '$lib/features/builder-chat/builder-conversation.svelte';
	import type { BuilderGuideDefinition } from '$lib/features/builder-guide/guide-types';
	import BuilderSetupFlow from '$lib/features/builder-setup/BuilderSetupFlow.svelte';

	type Props = {
		blueprint: BuilderBlueprintRecord;
		guide: BuilderGuideDefinition | null;
		initialMessage?: string | null;
		activeConversation?: unknown;
	};

	let { blueprint, guide, initialMessage = null, activeConversation = null }: Props = $props();
	let activeBlueprintId = $state('');
	let lifecycleVersion = 0;
	let mode = $state<'setup' | 'chat'>('setup');

	const conversation = createBuilderConversationController();

	function replaceActiveConversationState(handle: BuilderConversationHandle | null) {
		replaceState(
			resolve('/builder/[blueprintSlug]', {
				blueprintSlug: blueprint.id
			}),
			handle
				? {
						activeConversation: handle
					}
				: {}
		);
	}

	async function startChat(firstMessage: string, version = (lifecycleVersion += 1)) {
		const normalizedFirstMessage = firstMessage.trim();

		if (!normalizedFirstMessage) {
			return;
		}

		mode = 'chat';

		try {
				const handle = await conversation.start(normalizedFirstMessage, blueprint);

			if (version !== lifecycleVersion) {
				void conversation.dispose(handle);
				return;
			}

			replaceActiveConversationState(handle);
		} catch {
			if (version === lifecycleVersion) {
				mode = 'chat';
			}
		}
	}

	async function bootForBlueprint(version: number) {
		const historyHandle = parseBuilderConversationHandle(activeConversation);
		const nextInitialMessage = initialMessage?.trim() ?? '';

		mode = 'setup';

		if (!historyHandle && activeConversation !== null && activeConversation !== undefined) {
			replaceActiveConversationState(null);
		}

		if (historyHandle) {
			let resumedHandle: BuilderConversationHandle | null = null;

			try {
					resumedHandle = await conversation.resume(blueprint, 'chat', historyHandle);
			} catch {
				if (version === lifecycleVersion) {
					mode = 'chat';
				}

				return;
			}

			if (version !== lifecycleVersion) {
				if (resumedHandle) {
					void conversation.dispose(resumedHandle);
				}

				return;
			}

			if (resumedHandle) {
				mode = 'chat';
				replaceActiveConversationState(resumedHandle);
				return;
			}

			replaceActiveConversationState(null);
		}

		if (version !== lifecycleVersion) {
			return;
		}

		if (nextInitialMessage) {
			await startChat(nextInitialMessage, version);
		}
	}

	async function sendMessage(text: string) {
		const handle = await conversation.send(text);
		replaceActiveConversationState(handle);
	}

	$effect(() => {
			if (activeBlueprintId === blueprint.id) {
				return;
			}

			activeBlueprintId = blueprint.id;
			lifecycleVersion += 1;
			void bootForBlueprint(lifecycleVersion);
		});

	beforeNavigate((navigation) => {
		if (navigation.type === 'leave') {
			return;
		}

		const currentBuilderPath = resolve('/builder/[blueprintSlug]', {
			blueprintSlug: blueprint.id
		});

		if (navigation.to?.url.pathname !== currentBuilderPath) {
			replaceActiveConversationState(null);
			void conversation.dispose();
		}
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
		{#if conversation.isBusy}
			<section class="h-full min-h-0 min-w-0 bg-white"></section>
		{:else if mode === 'chat' && conversation.error}
			<section class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white p-2">
				<div class="min-h-0 flex-1 overflow-y-auto px-3 py-6 md:px-5">
					<div class="mx-auto w-full max-w-3xl">
						<div class="max-w-xl rounded-sm border border-red-200 bg-red-50 p-4 text-[0.82rem] text-red-700">
							{conversation.error}
						</div>
					</div>
				</div>
			</section>
		{:else if mode === 'chat' && conversation.handle}
			<BuilderChatPanel
				conversationId={conversation.handle.conversationId}
				resumeToken={conversation.handle.resumeToken}
				onSend={sendMessage}
			/>
		{:else if guide}
				<BuilderSetupFlow {blueprint} {guide} onComplete={startChat} />
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
			<BuilderBlueprintPanel {blueprint} />
	{/snippet}
</SplitPane>
