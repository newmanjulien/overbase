<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto, preloadData } from '$app/navigation';
	import { tick } from 'svelte';
	import { CUSTOM_NOTIFICATION_APP_ID } from '$lib/features/builder/data';
	import {
		createBuilderLaunchState,
		writePendingBuilderLaunch
	} from '$lib/features/builder/session/builder-launch';
	import { createFreeformRunSetup } from '@overbase/builder-sdk/app-protocol';
	import { IconButton } from '$lib/components/ui';
	import { ArrowUp, Plus } from 'lucide-svelte';

	const CHAT_HEADING = 'Build a notification that fits the way you work';
	const MAX_TEXTAREA_LINES = 11;

	let value = $state('');
	let textareaElement = $state<HTMLTextAreaElement | null>(null);
	let customBuilderRoutePreloaded = $state(false);
	let isSubmitting = $state(false);
	let shouldFocusComposer = $state(true);

	const customBuilderHref = resolve('/builder/[appSlug]', {
		appSlug: CUSTOM_NOTIFICATION_APP_ID
	});
	const canSubmit = $derived(value.trim().length > 0 && !isSubmitting);

	function preloadCustomBuilderRoute() {
		if (customBuilderRoutePreloaded) {
			return;
		}

		customBuilderRoutePreloaded = true;
		void preloadData(customBuilderHref).catch(() => undefined);
	}

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

	async function focusComposer() {
		if (!textareaElement || isSubmitting) {
			return;
		}

		await tick();

		if (!textareaElement || isSubmitting) {
			return;
		}

		textareaElement.focus({ preventScroll: true });
		shouldFocusComposer = false;
	}

	async function handleSubmit() {
		if (!canSubmit) {
			return;
		}

		const prompt = value.trim();
		const builderLaunch = createBuilderLaunchState(CUSTOM_NOTIFICATION_APP_ID, {
			fresh: true,
			setup: createFreeformRunSetup(prompt)
		});
		value = '';
		isSubmitting = true;
		preloadCustomBuilderRoute();
		writePendingBuilderLaunch(builderLaunch);

		try {
			await goto(customBuilderHref, {
				state: { builderLaunch }
			});
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
		void textareaElement;
		void isSubmitting;

		if (shouldFocusComposer && textareaElement && !isSubmitting) {
			void focusComposer();
		}
	});
</script>

<div class="flex w-full flex-col items-center">
	<section class="w-full">
		<div class="flex w-full flex-col items-center">
			<h1 class="mb-10 text-center text-[1.32rem] leading-tight tracking-[-0.02em] text-zinc-900">
				{CHAT_HEADING}
			</h1>

			<form
				class="mb-2 w-full rounded-[1.8rem] border border-zinc-200/90 bg-white px-3.5 pt-2.5 pb-2 md:mb-2.5 md:px-4.5 md:pt-3 md:pb-2"
				onsubmit={(event) => {
					event.preventDefault();
					void handleSubmit();
				}}
			>
				<div class="relative">
					<textarea
						bind:this={textareaElement}
						bind:value
						rows={1}
						aria-label="Prompt input"
						placeholder="Describe the notification you want to receive by email..."
						class="prompt-input w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-[0.8rem] leading-[1.34] text-zinc-800 outline-none placeholder:text-zinc-400 md:text-[0.84rem]"
						onfocus={preloadCustomBuilderRoute}
						onkeydown={(event) => {
							if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
								event.preventDefault();
								void handleSubmit();
							}
						}}
					></textarea>
				</div>

				<div class="mt-2 flex items-center justify-between md:mt-2.5">
					<IconButton
						type="button"
						aria-label="Add attachment"
						variant="ghost"
						class="size-7.5 rounded-full text-zinc-700"
						disabled
					>
						<Plus class="size-4 stroke-[2.25]" />
					</IconButton>

					<div class="flex items-center">
						<IconButton
							type="submit"
							aria-label="Send prompt"
							variant="primary"
							class="size-7.5 rounded-full bg-black transition-transform hover:bg-black hover:scale-[1.02] disabled:hover:scale-100"
							disabled={!canSubmit}
						>
							<ArrowUp class="size-3.75 stroke-[2.4]" />
						</IconButton>
					</div>
				</div>
			</form>
		</div>
	</section>
</div>
