<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { untrack } from 'svelte';
	import type { EmailDraft } from '@overbase/builder-sdk/email';
	import type { BuilderAppRecord } from '$lib/features/builder/data';
	import CustomEmailRightPanel from '$lib/features/builder/canvas/CustomEmailRightPanel.svelte';
	import SplitPane from '$lib/features/builder/canvas/SplitPane.svelte';
	import { BUILDER_CANVAS_SPLIT } from '$lib/features/builder/canvas/split-pane';
	import BuilderRunChatPanel from '$lib/features/builder/chat/BuilderRunChatPanel.svelte';
	import NativeBuilderLeaveGuard from '$lib/features/builder/navigation/NativeBuilderLeaveGuard.svelte';
	import { createBuilderSessionController } from '$lib/features/builder/session/builder-session.svelte';
	import {
		clearPendingBuilderLaunch,
		clearStoredBuilderSessionHandle,
		type BuilderLaunchState
	} from '$lib/features/builder/session/builder-launch';

	type Props = {
		app: BuilderAppRecord;
		launch?: BuilderLaunchState | null;
	};

	let { app, launch = null }: Props = $props();
	let bootedAppId = $state('');
	const initialAppId = untrack(() => app.id);
	const initialLaunch = untrack(() => launch?.appSlug === initialAppId ? launch : null);

	const builderSession = createBuilderSessionController(
		initialAppId,
		() => initialLaunch?.initialMessage?.trim() ?? ''
	);
	const runError = $derived(
		builderSession.session?.errorText ??
			(builderSession.messages.length > 0 ? builderSession.error : null)
	);
	const leaveGuardActive = $derived(Boolean(builderSession.handle || builderSession.messages.length > 0));

	function clearLaunchState() {
		clearPendingBuilderLaunch(app.id);
		replaceState(
			resolve('/builder/[appSlug]', {
				appSlug: app.id
			}),
			{}
		);
	}

	async function boot() {
		const activeLaunch = launch?.appSlug === app.id ? launch : null;
		const firstMessage = activeLaunch?.initialMessage?.trim() ?? '';

		if (activeLaunch?.fresh) {
			clearStoredBuilderSessionHandle(app.id);
		}

		if (firstMessage) {
			await builderSession.start(firstMessage, {
				startRequestId: activeLaunch?.startRequestId,
				resumeToken: activeLaunch?.resumeToken
			});
			clearLaunchState();
			return;
		}

		if (activeLaunch?.fresh) {
			return;
		}

		await builderSession.resumeStored();
	}

	async function sendMessage(text: string) {
		await builderSession.send(text);
	}

	async function saveDraft(draft: EmailDraft, baseEmailDraftVersion: number) {
		await builderSession.saveEmailDraft(draft, baseEmailDraftVersion);
	}

	$effect(() => {
		if (bootedAppId === app.id) {
			return;
		}

		bootedAppId = app.id;
		void boot().catch(() => undefined);
	});
</script>

<NativeBuilderLeaveGuard active={leaveGuardActive} />

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
		{#if builderSession.error && builderSession.messages.length === 0}
			<section class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white p-2">
				<div class="min-h-0 flex-1 overflow-y-auto px-3 py-6 md:px-5">
					<div class="mx-auto w-full max-w-3xl">
						<div class="max-w-xl rounded-sm border border-red-200 bg-red-50 p-4 text-[0.82rem] text-red-700">
							{builderSession.error}
						</div>
					</div>
				</div>
			</section>
		{:else if builderSession.handle || builderSession.messages.length > 0}
			<BuilderRunChatPanel
				messages={builderSession.messages}
				queryError={builderSession.queryError}
				{runError}
				canSendMessage={builderSession.canSend}
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
		<CustomEmailRightPanel
			{app}
			session={builderSession.session}
			onSaveDraft={saveDraft}
		/>
	{/snippet}
</SplitPane>
