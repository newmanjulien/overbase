<script lang="ts">
	import type { BuilderCardRecord } from '$lib/features/builder-data';
	import { api } from '$convex/_generated/api';
	import type { Id } from '$convex/_generated/dataModel';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { ArrowUp, Plus } from 'lucide-svelte';
	import { StickToBottom } from 'stick-to-bottom-svelte';

	type Props = {
		card: BuilderCardRecord;
		initialMessage: string;
	};

	const COMPOSER_TEXTAREA_MIN_HEIGHT = 20;
	const COMPOSER_TEXTAREA_MAX_HEIGHT = 96;

	let { card, initialMessage }: Props = $props();

	const client = useConvexClient();
	let conversationId = $state<Id<'conversations'> | null>(null);
	let startupKey = '';
	let startupVersion = 0;
	let isInitializing = $state(false);
	let initializationError = $state<string | null>(null);
	let sendError = $state<string | null>(null);
	let composerValue = $state('');
	let isSending = $state(false);
	let textareaElement = $state<HTMLTextAreaElement | null>(null);
	let scrollElement = $state<HTMLElement | null>(null);
	let contentElement = $state<HTMLElement | null>(null);

	const messagesQuery = useQuery(api.chat.listMessages, () =>
		conversationId ? { conversationId } : 'skip'
	);
	const messages = $derived(messagesQuery.data ?? []);
	const hasPendingAssistant = $derived(
		messages.some((message) => message.role === 'assistant' && message.status === 'pending')
	);
	const composerDisabled = $derived(
		isInitializing || isSending || hasPendingAssistant || Boolean(initializationError)
	);
	const canSend = $derived(!composerDisabled && composerValue.trim().length > 0);

	const stickToBottom = new StickToBottom({
		scrollElement: () => scrollElement,
		contentElement: () => contentElement,
		initial: 'instant',
		resize: 'instant',
		damping: 0.78,
		stiffness: 0.08,
		mass: 1.1
	});

	function getErrorMessage(error: unknown) {
		return error instanceof Error ? error.message : 'Something went wrong.';
	}

	function syncTextareaHeight() {
		if (!textareaElement) {
			return;
		}

		textareaElement.style.height = `${COMPOSER_TEXTAREA_MIN_HEIGHT}px`;

		const nextHeight = Math.min(
			Math.max(textareaElement.scrollHeight, COMPOSER_TEXTAREA_MIN_HEIGHT),
			COMPOSER_TEXTAREA_MAX_HEIGHT
		);

		textareaElement.style.height = `${nextHeight}px`;
		textareaElement.style.overflowY =
			textareaElement.scrollHeight > COMPOSER_TEXTAREA_MAX_HEIGHT ? 'auto' : 'hidden';
	}

	async function startConversation(firstMessage: string, cardContext: BuilderCardRecord) {
		const version = (startupVersion += 1);
		isInitializing = true;
		initializationError = null;
		sendError = null;
		conversationId = null;

		try {
			const result = await client.mutation(api.chat.startConversation, {
				cardSlug: cardContext.id,
				initialMessage: firstMessage
			});

			if (version !== startupVersion) {
				return;
			}

			conversationId = result.conversationId;
		} catch (error) {
			if (version !== startupVersion) {
				return;
			}

			initializationError = getErrorMessage(error);
		} finally {
			if (version === startupVersion) {
				isInitializing = false;
			}
		}
	}

	async function handleSend() {
		const message = composerValue.trim();

		if (!canSend || !message || !conversationId) {
			return;
		}

		composerValue = '';
		isSending = true;
		sendError = null;

		try {
			await client.mutation(api.chat.sendMessage, {
				conversationId,
				text: message
			});
		} catch (error) {
			composerValue = message;
			sendError = getErrorMessage(error);
		} finally {
			isSending = false;
		}
	}

	$effect(() => {
		const nextInitialMessage = initialMessage.trim();
		const nextStartupKey = `${card.id}:${nextInitialMessage}`;

		if (!nextInitialMessage || startupKey === nextStartupKey) {
			return;
		}

		startupKey = nextStartupKey;
		void startConversation(nextInitialMessage, card);
	});

	$effect(() => {
		void textareaElement;
		void composerValue;
		syncTextareaHeight();
	});
</script>

<section class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white p-2">
	<div bind:this={scrollElement} class="relative min-h-0 flex-1 overflow-y-auto px-3 py-6 md:px-5">
		<div bind:this={contentElement} class="mx-auto flex w-full max-w-3xl flex-col gap-4">
			{#if isInitializing}
				<div class="max-w-xl rounded-sm border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
					Starting chat...
				</div>
			{:else if initializationError}
				<div class="max-w-xl rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					{initializationError}
				</div>
			{:else if messagesQuery.error}
				<div class="max-w-xl rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					{messagesQuery.error.message}
				</div>
			{:else if messages.length === 0}
				<div class="max-w-xl rounded-sm border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
					Starting chat...
				</div>
			{/if}

			{#each messages as message (message._id)}
				{#if message.role === 'user'}
					<div
						class="ml-auto w-fit max-w-[82%] rounded-2xl bg-zinc-100 px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-zinc-800"
					>
						{message.text}
					</div>
				{:else}
					<div class="mr-auto max-w-[86%]">
						<div
							class={[
								'rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
								message.status === 'failed'
									? 'border border-red-200 bg-red-50 text-red-700'
									: 'bg-white text-zinc-800'
							]}
						>
							{#if message.status === 'pending'}
								<span class="inline-flex items-center gap-1 text-zinc-500">
									<span class="size-1.5 rounded-full bg-zinc-400"></span>
									<span class="size-1.5 rounded-full bg-zinc-300"></span>
									<span class="size-1.5 rounded-full bg-zinc-200"></span>
								</span>
							{:else}
								{message.text}
							{/if}
						</div>
					</div>
				{/if}
			{/each}

			{#if sendError}
				<div class="ml-auto max-w-[82%] rounded-sm border border-red-200 bg-red-50 p-3 text-xs text-red-700">
					{sendError}
				</div>
			{/if}
		</div>

		{#if messages.length > 0 && !stickToBottom.isNearBottom}
			<button
				type="button"
				aria-label="Jump to latest"
				class="absolute right-5 bottom-4 inline-flex size-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
				onclick={() => void stickToBottom.scrollToBottom('instant')}
			>
				<Plus class="size-4 rotate-45 stroke-[2.2]" />
			</button>
		{/if}
	</div>

	<form
		class="shrink-0 bg-white px-3 pt-2 pb-2 md:px-5 md:pt-2.5 md:pb-2.5"
		onsubmit={(event) => {
			event.preventDefault();
			void handleSend();
		}}
	>
		<div
			class="flex min-h-11 items-center gap-2 rounded-[1.8rem] border border-zinc-200/90 bg-white px-3.5 md:min-h-11.5 md:gap-2.5 md:px-4"
		>
			<button
				type="button"
				aria-label="Add context"
				class="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-zinc-700 disabled:cursor-default disabled:opacity-55"
				disabled
			>
				<Plus class="size-4 stroke-[2.25]" />
			</button>

			<textarea
				bind:this={textareaElement}
				bind:value={composerValue}
				rows={1}
				aria-label="Chat message"
				placeholder="Message the AI..."
				disabled={composerDisabled}
				style={`height: ${COMPOSER_TEXTAREA_MIN_HEIGHT}px;`}
				class="min-w-0 flex-1 resize-none overflow-hidden border-0 bg-transparent p-0 text-[0.84rem] leading-5 font-normal text-zinc-800 outline-none placeholder:text-zinc-400 disabled:cursor-default md:text-[0.9rem]"
				onkeydown={(event) => {
					if (event.key === 'Enter' && !event.shiftKey) {
						event.preventDefault();
						void handleSend();
					}
				}}
			></textarea>

			<button
				type="submit"
				aria-label="Send message"
				class="inline-flex size-7.5 shrink-0 items-center justify-center rounded-full bg-black text-white transition-colors disabled:bg-zinc-300 disabled:text-zinc-500"
				disabled={!canSend}
			>
				<ArrowUp class="size-3.75 stroke-[2.4]" />
			</button>
		</div>
	</form>
</section>
