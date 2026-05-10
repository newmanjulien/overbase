<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { untrack, type Snippet } from 'svelte';
	import type { EmailDraft } from '@overbase/builder-sdk/email';
	import type { BuilderAppRecord } from '$lib/features/builder/data';
	import BuilderChatError from '$lib/features/builder/chat/BuilderChatError.svelte';
	import BuilderChatSurface from '$lib/features/builder/chat/BuilderChatSurface.svelte';
	import CustomEmailRightPanel from '$lib/features/builder/canvas/CustomEmailRightPanel.svelte';
	import SplitPane from '$lib/features/builder/canvas/SplitPane.svelte';
	import { BUILDER_CANVAS_SPLIT } from '$lib/features/builder/canvas/split-pane';
	import NativeBuilderLeaveGuard from '$lib/features/builder/navigation/NativeBuilderLeaveGuard.svelte';
	import {
		clearPendingBuilderLaunch,
		clearStoredBuilderSessionHandle,
		type BuilderLaunchState
	} from '$lib/features/builder/session/builder-launch';
	import { createBuilderSessionController } from '$lib/features/builder/session/builder-session.svelte';

	type BuilderSessionWorkbenchStartRequest = Pick<
		BuilderLaunchState,
		'startRequestId' | 'resumeToken'
	>;

	export type BuilderSessionWorkbenchBeforeRunContext = {
		app: BuilderAppRecord;
		startRun: (
			firstMessage: string,
			request?: BuilderSessionWorkbenchStartRequest
		) => Promise<void>;
	};

	type Props = {
		app: BuilderAppRecord;
		launch?: BuilderLaunchState | null;
		beforeRun: Snippet<[BuilderSessionWorkbenchBeforeRunContext]>;
	};

	let { app, launch = null, beforeRun }: Props = $props();
	let bootedAppId = $state('');

	const initialAppId = untrack(() => app.id);
	const initialLaunch = untrack(() => (launch?.appSlug === initialAppId ? launch : null));
	const initialMessage = untrack(() => initialLaunch?.initialMessage?.trim() ?? '');
	const builderSession = createBuilderSessionController(initialAppId, () => initialMessage);

	let mode = $state<'beforeRun' | 'run'>(initialMessage ? 'run' : 'beforeRun');

	const runError = $derived(
		builderSession.session?.errorText ??
			(builderSession.messages.length > 0 ? builderSession.error : null)
	);
	const leaveGuardActive = $derived(Boolean(builderSession.handle || builderSession.messages.length > 0));
	const beforeRunContext = $derived<BuilderSessionWorkbenchBeforeRunContext>({
		app,
		startRun
	});

	function clearLaunchState() {
		clearPendingBuilderLaunch(app.id);
		replaceState(
			resolve('/builder/[appSlug]', {
				appSlug: app.id
			}),
			{}
		);
	}

	async function startRun(
		firstMessage: string,
		request?: BuilderSessionWorkbenchStartRequest
	) {
		const normalizedFirstMessage = firstMessage.trim();

		if (!normalizedFirstMessage) {
			return;
		}

		mode = 'run';
		await builderSession.start(normalizedFirstMessage, request);
		clearLaunchState();
	}

	async function boot() {
		const activeLaunch = launch?.appSlug === app.id ? launch : null;
		const firstMessage = activeLaunch?.initialMessage?.trim() ?? '';

		if (activeLaunch?.fresh) {
			clearStoredBuilderSessionHandle(app.id);
		}

		if (firstMessage) {
			await startRun(firstMessage, {
				startRequestId: activeLaunch?.startRequestId,
				resumeToken: activeLaunch?.resumeToken
			});
			return;
		}

		if (activeLaunch?.fresh) {
			mode = 'beforeRun';
			clearLaunchState();
			return;
		}

		const resumed = await builderSession.resumeStored();
		mode = resumed ? 'run' : 'beforeRun';
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
		void boot().catch(() => {
			mode = 'run';
		});
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
		{#if mode === 'run' && builderSession.error && builderSession.messages.length === 0}
			<section class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white p-2">
				<div class="min-h-0 flex-1 overflow-y-auto px-3 py-6 md:px-5">
					<div class="mx-auto w-full max-w-3xl">
						<BuilderChatError message={builderSession.error} />
					</div>
				</div>
			</section>
		{:else if mode === 'run' && (builderSession.handle || builderSession.messages.length > 0)}
			<BuilderChatSurface
				messages={builderSession.messages}
				queryError={builderSession.queryError}
				{runError}
				canComposeMessage={builderSession.canCompose}
				canSendMessage={builderSession.canSend}
				onSend={sendMessage}
			/>
		{:else}
			{@render beforeRun(beforeRunContext)}
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
