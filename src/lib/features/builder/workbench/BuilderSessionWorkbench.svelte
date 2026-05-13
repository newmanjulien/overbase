<script lang="ts">
	import { goto, replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { untrack, type Snippet } from 'svelte';
	import type { BuilderRunSetup } from '@overbase/builder-sdk/app-protocol';
	import type { EmailDraft } from '@overbase/builder-sdk/email';
	import type { BuilderAppRecord } from '$lib/features/builder/catalog';
	import BuilderChatError from './chat/BuilderChatError.svelte';
	import BuilderChatSurface from './chat/BuilderChatSurface.svelte';
	import CustomEmailRightPanel from '$lib/features/builder/email-output/CustomEmailRightPanel.svelte';
	import SplitPane from '$lib/components/layout/split-pane/SplitPane.svelte';
	import { BUILDER_WORKBENCH_SPLIT } from '$lib/features/builder/workbench/split-pane';
	import NativeBuilderLeaveGuard from '$lib/features/builder/workbench/NativeBuilderLeaveGuard.svelte';
	import {
		clearPendingBuilderLaunch,
		clearStoredBuilderSessionHandle,
		type BuilderLaunchState
	} from '$lib/features/builder/session/builder-launch';
	import { createBuilderSessionController } from '$lib/features/builder/session/builder-session.svelte';
	import { useRouteTitleState } from '$lib/components/chrome/shared/route-title.svelte';

	type BuilderSessionWorkbenchStartRequest = Pick<
		BuilderLaunchState,
		'startRequestId' | 'resumeToken'
	>;

	export type BuilderSessionWorkbenchBeforeRunContext = {
		app: BuilderAppRecord;
		startRun: (
			setup: BuilderRunSetup,
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
	const routeTitleState = useRouteTitleState();

	const initialAppId = untrack(() => app.id);
	const initialLaunch = untrack(() => (launch?.appSlug === initialAppId ? launch : null));
	const initialSetup = untrack(() => initialLaunch?.setup ?? null);
	const initialMessage = untrack(() => initialSetup?.initialMessage.trim() ?? '');
	const builderSession = createBuilderSessionController(initialAppId, () => initialMessage);

	let mode = $state<'beforeRun' | 'run'>(initialMessage ? 'run' : 'beforeRun');
	let isPublishNavigation = $state(false);

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
		setup: BuilderRunSetup,
		request?: BuilderSessionWorkbenchStartRequest
	) {
		const normalizedFirstMessage = setup.initialMessage.trim();

		if (!normalizedFirstMessage) {
			return;
		}

		mode = 'run';
		await builderSession.start(setup, request);
		clearLaunchState();
	}

	async function boot() {
		const activeLaunch = launch?.appSlug === app.id ? launch : null;
		const setup = activeLaunch?.setup ?? null;
		const firstMessage = setup?.initialMessage.trim() ?? '';

		if (activeLaunch?.fresh) {
			clearStoredBuilderSessionHandle(app.id);
		}

		if (setup && firstMessage) {
			await startRun(setup, {
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

	async function publishNotification() {
		await builderSession.publishNotification(routeTitleState.title);
		isPublishNavigation = true;

		try {
			await goto(resolve('/my-notifications'));
		} catch (error) {
			isPublishNavigation = false;
			throw error;
		}
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

<NativeBuilderLeaveGuard active={leaveGuardActive && !isPublishNavigation} />

<SplitPane
	minPrimary={BUILDER_WORKBENCH_SPLIT.minPrimary}
	minSecondary={BUILDER_WORKBENCH_SPLIT.minSecondary}
	defaultRatio={BUILDER_WORKBENCH_SPLIT.defaultRatio}
	mobileBreakpoint={BUILDER_WORKBENCH_SPLIT.mobileBreakpoint}
	keyboardStep={BUILDER_WORKBENCH_SPLIT.keyboardStep}
	handleWidth={BUILDER_WORKBENCH_SPLIT.handleWidth}
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
				canEditDraft={builderSession.canEditDraft}
				canSubmitDraft={builderSession.canSubmitDraft}
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
			onPublish={publishNotification}
		/>
	{/snippet}
</SplitPane>
