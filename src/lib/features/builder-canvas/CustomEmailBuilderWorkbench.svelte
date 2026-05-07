<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { CUSTOM_EMAIL_BUILDER_BLUEPRINT_ID, type EmailDraft } from '$lib/builder-domain/email';
	import type { BuilderBlueprintRecord } from '$lib/features/builder-data';
	import CustomEmailRightPanel from '$lib/features/builder-canvas/CustomEmailRightPanel.svelte';
	import SplitPane from '$lib/features/builder-canvas/SplitPane.svelte';
	import { BUILDER_CANVAS_SPLIT } from '$lib/features/builder-canvas/split-pane';
	import BuilderRunChatPanel from '$lib/features/builder-chat/BuilderRunChatPanel.svelte';
	import { createCustomEmailRunController } from '$lib/features/builder-chat/custom-email-run.svelte';

	type Props = {
		blueprint: BuilderBlueprintRecord;
		initialMessage?: string | null;
	};

	let { blueprint, initialMessage = null }: Props = $props();
	let bootedBlueprintId = $state('');

	const run = createCustomEmailRunController(
		CUSTOM_EMAIL_BUILDER_BLUEPRINT_ID,
		() => initialMessage?.trim() ?? ''
	);
	const runError = $derived(run.run?.errorText ?? (run.messages.length > 0 ? run.error : null));

	function clearInitialMessageState() {
			replaceState(
				resolve('/builder/[blueprintSlug]', {
					blueprintSlug: blueprint.id
				}),
			{}
		);
	}

	async function boot() {
		const firstMessage = initialMessage?.trim() ?? '';

		if (firstMessage) {
			await run.start(firstMessage);
			clearInitialMessageState();
			return;
		}

		await run.resumeStored();
	}

	async function sendMessage(text: string) {
		await run.send(text);
	}

	async function saveDraft(draft: EmailDraft, baseArtifactVersion: number) {
		await run.saveVisibleEmailDraft(draft, baseArtifactVersion);
	}

	$effect(() => {
			if (bootedBlueprintId === blueprint.id) {
				return;
			}

			bootedBlueprintId = blueprint.id;
			void boot();
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
		{#if run.error && run.messages.length === 0}
			<section class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white p-2">
				<div class="min-h-0 flex-1 overflow-y-auto px-3 py-6 md:px-5">
					<div class="mx-auto w-full max-w-3xl">
						<div class="max-w-xl rounded-sm border border-red-200 bg-red-50 p-4 text-[0.82rem] text-red-700">
							{run.error}
						</div>
					</div>
				</div>
			</section>
		{:else if run.handle || run.messages.length > 0}
			<BuilderRunChatPanel
				messages={run.messages}
				queryError={run.queryError}
				{runError}
				canSendMessage={run.canSend}
				onSend={sendMessage}
			/>
		{:else}
			<div class="flex h-full min-h-0 min-w-0 flex-col justify-center bg-white px-6">
				<div class="mx-auto max-w-sm text-center">
					<p class="text-[0.82rem] font-medium text-zinc-950">Start from the builder</p>
					<p class="mt-2 text-[0.72rem] leading-[1.5] text-zinc-500">
						Describe the notification you want from the builder screen to start a custom email.
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
			<CustomEmailRightPanel {blueprint} run={run.run} onSaveDraft={saveDraft} />
	{/snippet}
</SplitPane>
