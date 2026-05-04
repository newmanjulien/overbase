<script lang="ts">
	import { ArrowUp, Plus } from 'lucide-svelte';

	type Props = {
		onSubmit: (message: string) => void;
	};

	const COMPOSER_TEXTAREA_MIN_HEIGHT = 20;
	const COMPOSER_TEXTAREA_MAX_HEIGHT = 72;

	let { onSubmit }: Props = $props();
	let composerValue = $state('');
	let textareaElement = $state<HTMLTextAreaElement | null>(null);

	const canSubmitComposer = $derived(composerValue.trim().length > 0);

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

	function handleSubmit() {
		const nextMessage = composerValue.trim();

		if (!nextMessage) {
			return;
		}

		onSubmit(nextMessage);
		composerValue = '';
	}

	$effect(() => {
		void textareaElement;
		void composerValue;
		syncTextareaHeight();
	});
</script>

<form
	class="shrink-0 bg-white px-3 pt-2 pb-1 md:px-5 md:pt-2 md:pb-1"
	onsubmit={(event) => {
		event.preventDefault();
		handleSubmit();
	}}
>
	<div
		class="flex min-h-11 items-center gap-2 rounded-[1.8rem] border border-zinc-200/90 bg-white px-3.5 md:min-h-11.5 md:gap-2.5 md:px-4"
	>
		<button
			type="button"
			aria-label="Add context"
			class="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-zinc-700"
			disabled
		>
			<Plus class="size-4 stroke-[2.25]" />
		</button>

		<textarea
			bind:this={textareaElement}
			bind:value={composerValue}
			rows={1}
			aria-label="Builder prompt"
			placeholder="Explain how to customize your notification..."
			style={`height: ${COMPOSER_TEXTAREA_MIN_HEIGHT}px;`}
			class="min-w-0 flex-1 resize-none overflow-hidden border-0 bg-transparent p-0 text-[0.84rem] leading-5 font-normal text-zinc-800 outline-none placeholder:text-zinc-400 md:text-[0.9rem]"
		></textarea>

		<button
			type="submit"
			aria-label="Submit"
			class="inline-flex size-7.5 shrink-0 items-center justify-center rounded-full bg-black text-white transition-colors disabled:bg-zinc-300 disabled:text-zinc-500"
			disabled={!canSubmitComposer}
		>
			<ArrowUp class="size-3.75 stroke-[2.4]" />
		</button>
	</div>
</form>
