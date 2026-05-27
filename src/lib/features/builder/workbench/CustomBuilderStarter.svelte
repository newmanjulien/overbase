<script lang="ts">
	import { tick } from 'svelte';
	import { createFreeformRunSetup } from '@overbase/builder-sdk/app-protocol';
	import { IconButton } from '$lib/ui';
	import type { BuilderSessionWorkbenchBeforeRunContext } from './BuilderSessionWorkbench.svelte';
	import ArrowUpIcon from 'phosphor-svelte/lib/ArrowUpIcon';

	type Props = {
		context: BuilderSessionWorkbenchBeforeRunContext;
	};

	const MAX_TEXTAREA_LINES = 11;

	let { context }: Props = $props();
	let value = $state('');
	let textareaElement = $state<HTMLTextAreaElement | null>(null);
	let isSubmitting = $state(false);
	const canSubmit = $derived(value.trim().length > 0 && !isSubmitting);

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

	async function handleSubmit() {
		if (!canSubmit) {
			return;
		}

		const prompt = value.trim();
		value = '';
		isSubmitting = true;

		try {
			await context.startRun(createFreeformRunSetup(prompt));
		} finally {
			isSubmitting = false;
		}
	}

	$effect(() => {
		void textareaElement;
		void value;
		syncTextareaHeight();
	});

	$effect(() => {
		if (textareaElement && !isSubmitting) {
			void tick().then(() => textareaElement?.focus({ preventScroll: true }));
		}
	});
</script>

<div class="flex h-full min-h-0 min-w-0 flex-col justify-center bg-white px-6">
	<form
		class="mx-auto w-full max-w-2xl rounded-2xl border border-stone-200/90 bg-white px-4 pt-3 pb-2"
		onsubmit={(event) => {
			event.preventDefault();
			void handleSubmit();
		}}
	>
		<textarea
			bind:this={textareaElement}
			bind:value
			rows={1}
			aria-label="Custom email format description"
			placeholder="Describe the email format you had in mind"
			class="w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-[0.82rem] leading-[1.4] text-stone-800 outline-none placeholder:text-stone-400"
			onkeydown={(event) => {
				if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
					event.preventDefault();
					void handleSubmit();
				}
			}}
		></textarea>

		<div class="mt-2 flex justify-end">
			<IconButton
				type="submit"
				aria-label="Start custom builder"
				variant="primary"
				class="size-7.5 rounded-full bg-black transition-transform hover:bg-black hover:scale-[1.02] disabled:hover:scale-100"
				disabled={!canSubmit}
			>
				<ArrowUpIcon size={15} weight="regular" />
			</IconButton>
		</div>
	</form>
</div>
