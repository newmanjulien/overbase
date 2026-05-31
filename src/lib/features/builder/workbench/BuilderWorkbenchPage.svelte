<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { api } from '$convex/_generated/api';
	import { onDestroy, onMount, untrack } from 'svelte';
	import { APP_LINKS } from '$lib/app/app-links';
	import { useRouteTitleState } from '$lib/app/chrome/shared/route-title.svelte';
	import SplitPane from '$lib/layout/split-pane/SplitPane.svelte';
	import { Button } from '$lib/ui';
	import { watchMediaQuery } from '$lib/ui/viewport';
	import { useConvexClient } from 'convex-svelte';
	import {
		EmailFormatRulePanel,
		LinkDataSourcesModal
	} from '$lib/domain/email-format-rules';
	import type { BuilderRegistryEntry } from '$lib/features/builder/catalog';
	import BuilderEditorSidePanel from './layout/BuilderEditorSidePanel.svelte';
	import BuilderEmailEditorPanel from './editor/BuilderEmailEditorPanel.svelte';
	import BuilderPublishActionBar from './layout/BuilderPublishActionBar.svelte';
	import { BuilderWorkbenchState } from './state/builder-workbench-state.svelte';
	import BuilderOverviewPanel from './layout/BuilderOverviewPanel.svelte';
	import BuilderStartingPointSelectionPanel from './starting-point-selection/BuilderStartingPointSelectionPanel.svelte';
	import BuilderVariablePickerSheet from './variables/BuilderVariablePickerSheet.svelte';
	import { BuilderVariableDragCoordinator } from './variables/builder-variable-drag-coordinator.svelte';
	import { BUILDER_WORKBENCH_SPLIT } from './layout/split-pane';
	import ReconnectLinkedinContactsModal from './reconnect-linkedin/ReconnectLinkedinContactsModal.svelte';
	import type { ContactImport } from './reconnect-linkedin/linkedin-contacts-csv';

	type Props = {
		builder: BuilderRegistryEntry;
	};

	let { builder }: Props = $props();
	const client = useConvexClient();
	const routeTitleState = useRouteTitleState();
	const workbench = new BuilderWorkbenchState(untrack(() => builder));
	const variableDragCoordinator = new BuilderVariableDragCoordinator();
	const ruleDataSourceModal = $derived(
		builder.mode === 'public-data' ? (builder.ruleDataSourceModal ?? 'default') : 'default'
	);
	let isMobileWorkbench = $state(false);
	let linkDataSourcesModalOpen = $state(false);
	let publishing = $state(false);
	let publishError = $state<string | null>(null);
	let publishStateBuilderSlug = $state('');
	let linkedinContactsImport = $state<ContactImport | null>(null);
	const linkedinContactsAttachmentStatus = $derived(
		linkedinContactsImport
			? {
					count: linkedinContactsImport.contacts.length,
					fileName: linkedinContactsImport.fileName
				}
			: null
	);
	const requiresLinkedinContacts = $derived(
		builder.slug === 'reconnect-linkedin' &&
			workbench.selectedStartingPointId === 'linkedin-reconnect'
	);
	const publishPrerequisiteHint = $derived(
		requiresLinkedinContacts && !linkedinContactsImport
			? {
					text: 'Add your LinkedIn contacts CSV to enable Publish',
					actionLabel: 'Add contacts',
					onAction: openLinkedinContactsModal
				}
			: null
	);
	const publishDisabled = $derived(
		publishing || !workbench.canPublish || (requiresLinkedinContacts && !linkedinContactsImport)
	);
	const publishLabel = $derived(publishing ? 'Publishing...' : 'Publish');

	const linkedinContactsRequiredError =
		'Upload your LinkedIn contacts CSV before publishing this format.';

	onMount(() => {
		return watchMediaQuery(
			`(max-width: ${BUILDER_WORKBENCH_SPLIT.mobileBreakpoint - 0.02}px)`,
			(matches) => {
				isMobileWorkbench = matches;
			}
		);
	});

	onDestroy(() => {
		variableDragCoordinator.endDrag();
	});

	$effect(() => {
		workbench.syncBuilder(builder);
	});

	$effect(() => {
		if (publishStateBuilderSlug !== builder.slug) {
			publishStateBuilderSlug = builder.slug;
			publishing = false;
			publishError = null;
			linkedinContactsImport = null;
		}
	});

	$effect(() => {
		const updateTitle = (nextTitle: string) => {
			workbench.updateTitle(nextTitle);
			routeTitleState.title = workbench.title;
		};

		routeTitleState.onTitleChange = updateTitle;

		return () => {
			if (routeTitleState.onTitleChange === updateTitle) {
				routeTitleState.onTitleChange = null;
			}
		};
	});

	$effect(() => {
		routeTitleState.title = workbench.title;
	});

	function getErrorMessage(error: unknown) {
		return error instanceof Error ? error.message : 'Could not publish email format.';
	}

	function openLinkedinContactsModal() {
		linkDataSourcesModalOpen = true;
	}

	function acceptLinkedinContactsImport(contactsImport: ContactImport) {
		linkedinContactsImport = contactsImport;

		if (publishError === linkedinContactsRequiredError) {
			publishError = null;
		}
	}

	async function publishEmailFormat() {
		if (publishing) {
			return;
		}

		const input = workbench.createPublishInput();

		if (!input) {
			return;
		}

		if (requiresLinkedinContacts && !linkedinContactsImport) {
			publishError = linkedinContactsRequiredError;
			linkDataSourcesModalOpen = true;
			return;
		}

		input.linkedinContactsSource = linkedinContactsImport;

		publishing = true;
		publishError = null;

		try {
			await client.mutation(api.emailFormats.publishEmailFormat, input);
			await goto(resolve(APP_LINKS.emailFormats.pathname));
		} catch (error) {
			publishError = getErrorMessage(error);
		} finally {
			publishing = false;
		}
	}
</script>

{#key builder.slug}
	{#if isMobileWorkbench}
		{#if workbench.step === 'starting-point-selection' && builder.startingPointSelection.kind === 'guided'}
			<BuilderStartingPointSelectionPanel
				startingPointSelection={builder.startingPointSelection}
				onAnswersChange={workbench.updateAnswers}
				onSubmit={workbench.continueToEditor}
			/>
		{:else if workbench.editor && builder.mode === 'public-data'}
			<section
				class="flex h-full min-h-0 min-w-0 flex-col overflow-y-auto bg-white"
				role="group"
				aria-label="Rules builder workbench"
			>
				<div class="shrink-0 border-b border-stone-100">
					<BuilderEmailEditorPanel
						editor={workbench.editor}
						variables={builder.variables}
						dragCoordinator={variableDragCoordinator}
						readOnly
					/>
				</div>
				<div class="shrink-0">
					<EmailFormatRulePanel
						rules={workbench.rulesDraft}
						onRulesChange={workbench.updateRules}
						onLinkDataSources={() => (linkDataSourcesModalOpen = true)}
						ruleDataSourceAction={workbench.ruleDataSourceAction ?? undefined}
						infoCard={builder.ruleInfoCard}
						canEditRuleText={false}
						canEditRuleList={false}
					/>
				</div>
				<BuilderPublishActionBar
					disabled={publishDisabled}
					label={publishLabel}
					error={publishError}
					onPublish={publishEmailFormat}
					{publishPrerequisiteHint}
					contactAttachmentStatus={linkedinContactsAttachmentStatus}
					onOpenContactAttachment={openLinkedinContactsModal}
					buttonClass="h-10 w-full text-[0.8rem]"
				/>
			</section>
		{:else if workbench.editor && builder.mode === 'internal-data'}
			<section
				class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white"
				role="group"
				aria-label="Builder workbench"
			>
				<div class="min-h-0 flex-1 overflow-y-auto">
					<div class="min-h-[65vh] shrink-0">
						<BuilderEmailEditorPanel
							editor={workbench.editor}
							variables={builder.variables}
							dragCoordinator={variableDragCoordinator}
							variableInsertionRequest={workbench.variableInsertionRequest}
							onVariableInsertionRequestHandled={workbench.clearVariableInsertionRequest}
						/>
					</div>
				</div>
				<BuilderVariablePickerSheet
					open={workbench.variablePickerOpen}
					variables={builder.variables}
					onSelect={workbench.requestVariableInsertion}
					onClose={workbench.closeVariablePicker}
				/>
				<BuilderPublishActionBar
					disabled={publishDisabled}
					label={publishLabel}
					error={publishError}
					onPublish={publishEmailFormat}
					buttonClass="h-10 w-full text-[0.8rem]"
					mobileOrder="secondary-first"
				>
					{#snippet secondaryAction()}
						<Button
							variant="secondary"
							class="h-10 w-full text-[0.8rem]"
							onclick={workbench.openVariablePicker}
						>
							Add variable
						</Button>
					{/snippet}
				</BuilderPublishActionBar>
			</section>
		{/if}
	{:else}
		<SplitPane
			primarySide="right"
			minPrimary={BUILDER_WORKBENCH_SPLIT.minPrimary}
			minSecondary={BUILDER_WORKBENCH_SPLIT.minSecondary}
			defaultRatio={BUILDER_WORKBENCH_SPLIT.defaultRatio}
			mobileBreakpoint={BUILDER_WORKBENCH_SPLIT.mobileBreakpoint}
			keyboardStep={BUILDER_WORKBENCH_SPLIT.keyboardStep}
			handleWidth={BUILDER_WORKBENCH_SPLIT.handleWidth}
			label="Resize build format panels"
		>
			{#snippet primary()}
				{#if workbench.step === 'starting-point-selection' && builder.startingPointSelection.kind === 'guided'}
					<BuilderStartingPointSelectionPanel
						startingPointSelection={builder.startingPointSelection}
						onAnswersChange={workbench.updateAnswers}
						onSubmit={workbench.continueToEditor}
					/>
				{:else}
					{#if builder.mode === 'public-data'}
						<aside class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
							<EmailFormatRulePanel
								rules={workbench.rulesDraft}
								onRulesChange={workbench.updateRules}
								onLinkDataSources={() => (linkDataSourcesModalOpen = true)}
								ruleDataSourceAction={workbench.ruleDataSourceAction ?? undefined}
								infoCard={builder.ruleInfoCard}
								canEditRuleText={false}
								canEditRuleList={false}
							/>
							<BuilderPublishActionBar
								disabled={publishDisabled}
								label={publishLabel}
								error={publishError}
								onPublish={publishEmailFormat}
								{publishPrerequisiteHint}
								contactAttachmentStatus={linkedinContactsAttachmentStatus}
								onOpenContactAttachment={openLinkedinContactsModal}
							/>
						</aside>
					{:else}
						<BuilderEditorSidePanel
							variables={builder.variables}
							dragCoordinator={variableDragCoordinator}
							{publishDisabled}
							{publishLabel}
							{publishError}
							onPublish={publishEmailFormat}
						/>
					{/if}
				{/if}
			{/snippet}

			{#snippet secondary()}
				<section
					class="relative h-full min-h-0 min-w-0 overflow-hidden bg-white"
					role="group"
					aria-label="Builder workbench"
				>
					{#if workbench.step === 'starting-point-selection'}
						<div class="absolute inset-0 z-10">
							<BuilderOverviewPanel {builder} />
						</div>
					{:else if workbench.editor}
						<div class="absolute inset-0 z-10 opacity-100">
							<BuilderEmailEditorPanel
								editor={workbench.editor}
								variables={builder.variables}
								dragCoordinator={variableDragCoordinator}
								readOnly={builder.mode === 'public-data'}
								onVariableInsertionRequestHandled={workbench.clearVariableInsertionRequest}
							/>
						</div>
					{/if}
				</section>
			{/snippet}
		</SplitPane>
	{/if}
{/key}

{#if ruleDataSourceModal === 'reconnect-linkedin'}
	<ReconnectLinkedinContactsModal
		open={linkDataSourcesModalOpen}
		contactsImport={linkedinContactsImport}
		onClose={() => (linkDataSourcesModalOpen = false)}
		onContactsImported={acceptLinkedinContactsImport}
	/>
{:else}
	<LinkDataSourcesModal
		open={linkDataSourcesModalOpen}
		onClose={() => (linkDataSourcesModalOpen = false)}
	/>
{/if}
