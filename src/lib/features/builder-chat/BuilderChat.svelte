<script lang="ts">
	import { ArrowUp, Plus } from 'lucide-svelte';

	const CHAT_HEADING = 'Build notifications that fit the way you work';
	const MAX_TEXTAREA_LINES = 11;

	let value = $state('');
	let textareaElement = $state<HTMLTextAreaElement | null>(null);

	const canSubmit = $derived(value.trim().length > 0);

	function syncTextareaHeight() {
		if (!textareaElement) {
			return;
		}

		const computedStyle = window.getComputedStyle(textareaElement);
		const lineHeight = Number.parseFloat(computedStyle.lineHeight);
		const paddingHeight =
			Number.parseFloat(computedStyle.paddingTop) +
			Number.parseFloat(computedStyle.paddingBottom) +
			Number.parseFloat(computedStyle.borderTopWidth) +
			Number.parseFloat(computedStyle.borderBottomWidth);
		const maxHeight = Number.isFinite(lineHeight)
			? lineHeight * MAX_TEXTAREA_LINES + paddingHeight
			: null;

		textareaElement.style.height = '0px';
		const nextHeight =
			maxHeight === null
				? textareaElement.scrollHeight
				: Math.min(textareaElement.scrollHeight, maxHeight);
		textareaElement.style.height = `${nextHeight}px`;
		textareaElement.style.overflowY =
			maxHeight !== null && textareaElement.scrollHeight > maxHeight ? 'auto' : 'hidden';
	}

	function handleSubmit() {
		if (!canSubmit) {
			return;
		}

		value = '';
	}

	$effect(() => {
		void textareaElement;
		void value;
		syncTextareaHeight();
	});

</script>

<div class="flex w-full flex-col items-center">
	<section class="w-full">
		<div class="flex w-full flex-col items-center">
			<h1 class="mb-10 text-center text-[1.4rem] leading-tight tracking-[-0.02em] text-zinc-900">
				{CHAT_HEADING}
			</h1>

			<form
				class="mb-2 w-full rounded-[1.8rem] border border-zinc-200/90 bg-white px-3.5 pt-2.5 pb-2 md:mb-2.5 md:px-4.5 md:pt-3 md:pb-2"
				onsubmit={(event) => {
					event.preventDefault();
					handleSubmit();
				}}
			>
				<div class="relative">
					<textarea
						bind:this={textareaElement}
						bind:value
						rows={1}
						aria-label="Prompt input"
						placeholder="Describe the notification you want to receive by email..."
						class="prompt-input w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-[0.84rem] leading-[1.38] text-zinc-800 outline-none placeholder:text-zinc-400 md:text-[0.9rem]"
					></textarea>
				</div>

				<div class="mt-2 flex items-center justify-between md:mt-2.5">
					<button
						type="button"
						aria-label="Add attachment"
						class="group relative inline-flex items-center justify-center text-zinc-700 disabled:cursor-default disabled:opacity-55"
						disabled
					>
						<span
							aria-hidden="true"
							class="pointer-events-none absolute -inset-2 rounded-full transition-colors group-hover:bg-zinc-100"
						></span>
						<Plus class="relative size-4 stroke-[2.25]" />
					</button>

					<div class="flex items-center">
						<button
							type="submit"
							aria-label="Send prompt"
							class="inline-flex size-7.5 items-center justify-center rounded-full bg-black text-white transition-transform hover:scale-[1.02] disabled:cursor-default disabled:bg-zinc-300 disabled:text-zinc-500 disabled:hover:scale-100"
							disabled={!canSubmit}
						>
							<ArrowUp class="size-3.75 stroke-[2.4]" />
						</button>
					</div>
				</div>
			</form>
		</div>
	</section>
</div>
