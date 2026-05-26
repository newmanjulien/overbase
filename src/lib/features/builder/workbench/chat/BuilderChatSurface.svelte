<script lang="ts">
	import { tick } from 'svelte';
	import ArrowUpIcon from 'phosphor-svelte/lib/ArrowUpIcon';
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
	import { StickToBottom } from 'stick-to-bottom-svelte';
	import { IconButton } from '$lib/ui';
	import BuilderChatError from './BuilderChatError.svelte';

	type ChatMessage = {
		_id: string;
		role: 'user' | 'assistant';
		text: string;
		status: 'pending' | 'streaming' | 'complete' | 'failed';
		errorText?: string;
	};

	type Props = {
		messages: ChatMessage[];
		queryError?: Error | null;
		runError?: string | null;
		canEditDraft?: boolean;
		canSubmitDraft?: boolean;
		onSend: (text: string) => Promise<void>;
	};

	const COMPOSER_TEXTAREA_MIN_HEIGHT = 20;
	const COMPOSER_TEXTAREA_MAX_HEIGHT = 96;

	let {
		messages,
		queryError = null,
		runError = null,
		canEditDraft = true,
		canSubmitDraft = true,
		onSend
	}: Props = $props();

	let sendError = $state<string | null>(null);
	let composerValue = $state('');
	let isSending = $state(false);
	let shouldFocusComposer = $state(true);
	let textareaElement = $state<HTMLTextAreaElement | null>(null);
	let scrollElement = $state<HTMLElement | null>(null);
	let contentElement = $state<HTMLElement | null>(null);

	const composerReadOnly = $derived(
		Boolean(queryError) || Boolean(runError) || !canEditDraft
	);
	const canSend = $derived(
		composerValue.trim().length > 0 &&
			!isSending &&
			!composerReadOnly &&
			canSubmitDraft
	);

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

	async function focusComposer() {
		if (!textareaElement || composerReadOnly) {
			return;
		}

		await tick();

		if (!textareaElement || composerReadOnly) {
			return;
		}

		textareaElement.focus({ preventScroll: true });
	}

	async function handleSend() {
		const message = composerValue.trim();

		if (!canSend || !message) {
			return;
		}

		composerValue = '';
		isSending = true;
		sendError = null;

		try {
			await onSend(message);
		} catch (error) {
			composerValue = composerValue.trim().length > 0 ? composerValue : message;
			sendError = getErrorMessage(error);
		} finally {
			isSending = false;
			shouldFocusComposer = true;
		}
	}

	$effect(() => {
		void textareaElement;
		void composerValue;
		syncTextareaHeight();
	});

	$effect(() => {
		void textareaElement;
		void composerReadOnly;

		if (shouldFocusComposer && textareaElement && !composerReadOnly) {
			shouldFocusComposer = false;
			void focusComposer();
		}
	});
</script>

<section class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white p-2">
	<div bind:this={scrollElement} class="relative min-h-0 flex-1 overflow-y-auto px-3 py-6 md:px-5">
		<div bind:this={contentElement} class="mx-auto flex w-full max-w-3xl flex-col gap-4">
			<p class="w-full pb-1.5 text-center text-xs leading-snug text-stone-400">
				Explain the emails you want your team to receive
			</p>

			{#if queryError}
				<BuilderChatError message={queryError.message} />
			{/if}

			{#if runError}
				<BuilderChatError message={runError} />
			{/if}

			{#each messages as message (message._id)}
				{#if message.role === 'user'}
					<div
						class="ml-auto w-fit max-w-[82%] rounded-2xl bg-stone-100 px-4 py-2.5 text-[0.82rem] leading-[1.55] whitespace-pre-wrap text-stone-800"
					>
						{message.text}
					</div>
				{:else}
					<div class="mr-auto max-w-[86%]">
						<div
							class={[
								'rounded-2xl px-4 py-2.5 text-[0.82rem] leading-[1.55] whitespace-pre-wrap',
								message.status === 'failed'
									? 'border border-red-200 bg-red-50 text-red-700'
									: 'bg-white text-stone-800'
							]}
						>
							{#if (message.status === 'pending' || message.status === 'streaming') && !message.text}
								<span class="inline-flex items-center gap-0.5 text-stone-500">
									<span class="typing-dot size-1 rounded-full bg-stone-400"></span>
									<span class="typing-dot size-1 rounded-full bg-stone-400"></span>
									<span class="typing-dot size-1 rounded-full bg-stone-400"></span>
								</span>
							{:else}
								{message.text}
								{#if message.status === 'pending' || message.status === 'streaming'}
									<span class="ml-0.5 inline-block h-4 w-px translate-y-0.5 bg-stone-400"></span>
								{/if}
							{/if}
							{#if message.status === 'failed' && message.errorText}
								<p class="mt-2 border-t border-red-200 pt-2 text-xs leading-snug text-red-600">
									{message.errorText}
								</p>
							{/if}
						</div>
					</div>
				{/if}
			{/each}

			{#if sendError}
				<div class="ml-auto max-w-[82%] rounded-sm border border-red-200 bg-red-50 p-3 text-[0.72rem] text-red-700">
					{sendError}
				</div>
			{/if}
		</div>

		{#if messages.length > 0 && !stickToBottom.isNearBottom}
			<IconButton
				type="button"
				aria-label="Jump to latest"
				variant="secondary"
				class="absolute right-5 bottom-4 size-8 rounded-full text-stone-700 shadow-sm"
				onclick={() => void stickToBottom.scrollToBottom('instant')}
			>
				<PlusIcon size={16} weight="regular" class="rotate-45" />
			</IconButton>
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
			class="flex min-h-11 items-center gap-2 rounded-[1.8rem] border border-stone-200/90 bg-white px-3.5 md:min-h-11.5 md:gap-2.5 md:px-4"
		>
			<textarea
				bind:this={textareaElement}
				bind:value={composerValue}
				rows={1}
				aria-label="Chat message"
				placeholder="Explain the email you want your team to receive..."
				readonly={composerReadOnly}
				style={`height: ${COMPOSER_TEXTAREA_MIN_HEIGHT}px;`}
				class="min-w-0 flex-1 resize-none overflow-hidden border-0 bg-transparent p-0 text-[0.8rem] leading-[1.2rem] font-normal text-stone-800 outline-none placeholder:text-stone-400 read-only:cursor-default md:text-[0.84rem]"
				onkeydown={(event) => {
					if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
						event.preventDefault();
						void handleSend();
					}
				}}
			></textarea>

			<IconButton
				type="submit"
				aria-label="Send message"
				variant="primary"
				class="size-7.5 shrink-0 rounded-full bg-black hover:bg-black"
				disabled={!canSend}
			>
				<ArrowUpIcon size={15} weight="regular" />
			</IconButton>
		</div>
	</form>
</section>

<style>
	.typing-dot {
		animation: typing-dot-fade 1.15s ease-in-out infinite;
		opacity: 0.28;
	}

	.typing-dot:nth-child(2) {
		animation-delay: 0.18s;
	}

	.typing-dot:nth-child(3) {
		animation-delay: 0.36s;
	}

	@keyframes typing-dot-fade {
		0%,
		80%,
		100% {
			opacity: 0.28;
		}

		35% {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.typing-dot {
			animation: none;
			opacity: 0.55;
		}
	}
</style>
