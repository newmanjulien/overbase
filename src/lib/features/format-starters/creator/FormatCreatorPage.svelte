<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { api } from '$convex/_generated/api';
	import { onDestroy, onMount, untrack } from 'svelte';
	import { APP_LINKS } from '$lib/app/app-links';
	import { useRouteTitleState } from '$lib/app/chrome/shared/route-title.svelte';
	import { useViewerSession } from '$lib/auth/viewer-session.svelte';
	import SplitPane from '$lib/layout/split-pane/SplitPane.svelte';
	import { Button } from '$lib/ui';
	import { watchMediaQuery } from '$lib/ui/viewport';
	import { useConvexClient } from 'convex-svelte';
	import {
		EmailFormatRulePanel,
		LinkDataSourcesModal
	} from '$lib/domain/email-format-rules';
	import type { FormatStarter } from '$lib/features/format-starters/catalog';
	import FormatCreatorEditorSidePanel from './layout/FormatCreatorEditorSidePanel.svelte';
	import FormatEmailEditorPanel from './editor/FormatEmailEditorPanel.svelte';
	import FormatCreateActionBar from './layout/FormatCreateActionBar.svelte';
	import { FormatCreatorState } from './state/format-creator-state.svelte';
	import FormatStarterOverviewPanel from './layout/FormatStarterOverviewPanel.svelte';
	import FormatStarterSelectionPanel from './starting-point-selection/FormatStarterSelectionPanel.svelte';
	import FormatVariablePickerSheet from './variables/FormatVariablePickerSheet.svelte';
	import { FormatVariableDragCoordinator } from './variables/format-variable-drag-coordinator.svelte';
	import { FORMAT_CREATOR_SPLIT } from './layout/split-pane';
	import ReconnectLinkedinContactsModal from './reconnect-linkedin/ReconnectLinkedinContactsModal.svelte';
	import type { ContactImport } from '$lib/features/external-data/linkedin-contacts-csv';
	import {
		getEmailFormatCreationDataSourceRequirement
	} from '$shared/email-format-definitions';

	type Props = {
		formatStarter: FormatStarter;
	};

	let { formatStarter }: Props = $props();
	const client = useConvexClient();
	const viewerSession = useViewerSession();
	const routeTitleState = useRouteTitleState();
	const creator = new FormatCreatorState(untrack(() => formatStarter));
	const variableDragCoordinator = new FormatVariableDragCoordinator();
	const viewerUserId = $derived(viewerSession.viewer?.user._id ?? null);
	const selectedFormatSpec = $derived(creator.selectedFormatSpec);
	const titleEditable = $derived(Boolean(selectedFormatSpec?.contentEditPolicy.title));
	const creationDataSourceRequirement = $derived(
		selectedFormatSpec ? getEmailFormatCreationDataSourceRequirement(selectedFormatSpec) : null
	);
	let isMobileCreator = $state(false);
	let linkDataSourcesModalOpen = $state(false);
	let creatingFormat = $state(false);
	let createFormatError = $state<string | null>(null);
	let createFormatStateFormatStarterSlug = $state('');
	let linkedinContactsImport = $state<ContactImport | null>(null);
	const linkedinContactsAttachmentStatus = $derived(
		linkedinContactsImport
			? {
					count: linkedinContactsImport.contacts.length,
					fileName: linkedinContactsImport.fileName
				}
			: null
	);
	const requiresLinkedinContactsBeforeCreate = $derived(
		creationDataSourceRequirement?.kind === 'linkedinContacts'
	);
	const dataSourceControls = $derived(
		creator.dataSourceControls
			.filter((control) => control.ruleId === creationDataSourceRequirement?.ruleId)
			.map((control) =>
				linkedinContactsImport && creationDataSourceRequirement
					? {
							...control,
							actionLabel: creationDataSourceRequirement.linkedLabel,
							disabled: true
						}
					: control
			)
	);
	const createFormatPrerequisiteHint = $derived(
		requiresLinkedinContactsBeforeCreate && !linkedinContactsImport
			? {
					text: 'Add your LinkedIn contacts to create this format',
					actionLabel: 'Add contacts',
					onAction: openLinkedinContactsModal
				}
			: null
	);
	const createFormatDisabled = $derived(
		creatingFormat ||
			!creator.canCreateFormat ||
			(requiresLinkedinContactsBeforeCreate && !linkedinContactsImport)
	);
	const createFormatLabel = $derived(creatingFormat ? 'Creating...' : 'Create format');

	const linkedinContactsRequiredError =
		'Upload your LinkedIn contacts CSV before creating this format.';

	onMount(() => {
		return watchMediaQuery(
			`(max-width: ${FORMAT_CREATOR_SPLIT.mobileBreakpoint - 0.02}px)`,
			(matches) => {
				isMobileCreator = matches;
			}
		);
	});

	onDestroy(() => {
		variableDragCoordinator.endDrag();
	});

	$effect(() => {
		creator.syncFormatStarter(formatStarter);
	});

	$effect(() => {
		if (createFormatStateFormatStarterSlug !== formatStarter.slug) {
			createFormatStateFormatStarterSlug = formatStarter.slug;
			creatingFormat = false;
			createFormatError = null;
			linkedinContactsImport = null;
		}
	});

	$effect(() => {
		const updateTitle = (nextTitle: string) => {
			creator.updateTitle(nextTitle);
			routeTitleState.title = creator.title;
		};

		routeTitleState.editable = titleEditable;
		routeTitleState.onTitleChange = titleEditable ? updateTitle : null;

		return () => {
			if (routeTitleState.onTitleChange === updateTitle) {
				routeTitleState.onTitleChange = null;
			}
			if (routeTitleState.editable === titleEditable) {
				routeTitleState.editable = null;
			}
		};
	});

	$effect(() => {
		routeTitleState.title = creator.title;
	});

	function getErrorMessage(error: unknown) {
		return error instanceof Error ? error.message : 'Could not create email format.';
	}

	function openLinkedinContactsModal() {
		if (creationDataSourceRequirement?.attachMode === 'upload-new') {
			linkDataSourcesModalOpen = true;
		}
	}

	function acceptLinkedinContactsImport(contactsImport: ContactImport) {
		linkedinContactsImport = contactsImport;
		linkDataSourcesModalOpen = false;

		if (createFormatError === linkedinContactsRequiredError) {
			createFormatError = null;
		}
	}

	async function createEmailFormat() {
		if (creatingFormat) {
			return;
		}

		if (requiresLinkedinContactsBeforeCreate && !linkedinContactsImport) {
			createFormatError = linkedinContactsRequiredError;
			linkDataSourcesModalOpen = true;
			return;
		}

		const input = creator.createFormatInput({
			viewerUserId,
			externalDataImport: linkedinContactsImport
				? {
						kind: 'linkedinContacts',
						fileName: linkedinContactsImport.fileName,
						contacts: linkedinContactsImport.contacts
					}
				: null
		});

		if (!input) {
			createFormatError = 'Could not create email format from the selected variant.';
			return;
		}

		creatingFormat = true;
		createFormatError = null;

		try {
			await client.mutation(api.emailFormats.createEmailFormatFromStarter, input);
			await goto(resolve(APP_LINKS.emailFormats.pathname));
		} catch (error) {
			createFormatError = getErrorMessage(error);
		} finally {
			creatingFormat = false;
		}
	}
</script>

{#key formatStarter.slug}
	{#if isMobileCreator}
		{#if creator.step === 'starting-point-selection' && formatStarter.startingPointSelection.kind === 'guided'}
			<FormatStarterSelectionPanel
				startingPointSelection={formatStarter.startingPointSelection}
				onAnswersChange={creator.updateAnswers}
				onSubmit={creator.continueToEditor}
			/>
		{:else if creator.editor && formatStarter.mode === 'public-data'}
			<section
				class="flex h-full min-h-0 min-w-0 flex-col overflow-y-auto bg-white"
				role="group"
				aria-label="Rules format creator"
			>
				<div class="shrink-0 border-b border-stone-100">
					<FormatEmailEditorPanel
						editor={creator.editor}
						variables={formatStarter.variables}
						dragCoordinator={variableDragCoordinator}
						editPolicy={selectedFormatSpec?.contentEditPolicy}
					/>
				</div>
				<div class="shrink-0">
					<EmailFormatRulePanel
						rules={creator.rulesDraft}
						onRulesChange={creator.updateRules}
						onLinkDataSources={creationDataSourceRequirement
							? openLinkedinContactsModal
							: undefined}
						ruleDataSourceControls={dataSourceControls}
						infoCard={formatStarter.ruleInfoCard}
						canEditRuleText={selectedFormatSpec?.rulesEditPolicy.text ?? false}
						canEditRuleList={selectedFormatSpec?.rulesEditPolicy.list ?? false}
					/>
				</div>
				<FormatCreateActionBar
					disabled={createFormatDisabled}
					label={createFormatLabel}
					error={createFormatError}
					onPublish={createEmailFormat}
					publishPrerequisiteHint={createFormatPrerequisiteHint}
					contactAttachmentStatus={linkedinContactsAttachmentStatus}
					onOpenContactAttachment={openLinkedinContactsModal}
					buttonClass="h-10 w-full text-[0.8rem]"
				/>
			</section>
		{:else if creator.editor && formatStarter.mode === 'internal-data'}
			<section
				class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white"
				role="group"
				aria-label="FormatStarter creator"
			>
				<div class="min-h-0 flex-1 overflow-y-auto">
					<div class="min-h-[65vh] shrink-0">
						<FormatEmailEditorPanel
							editor={creator.editor}
							variables={formatStarter.variables}
							dragCoordinator={variableDragCoordinator}
							variableInsertionRequest={creator.variableInsertionRequest}
							onVariableInsertionRequestHandled={creator.clearVariableInsertionRequest}
						/>
					</div>
				</div>
				<FormatVariablePickerSheet
					open={creator.variablePickerOpen}
					variables={formatStarter.variables}
					onSelect={creator.requestVariableInsertion}
					onClose={creator.closeVariablePicker}
				/>
				<FormatCreateActionBar
					disabled={createFormatDisabled}
					label={createFormatLabel}
					error={createFormatError}
					onPublish={createEmailFormat}
					buttonClass="h-10 w-full text-[0.8rem]"
					mobileOrder="secondary-first"
				>
					{#snippet secondaryAction()}
						<Button
							variant="secondary"
							class="h-10 w-full text-[0.8rem]"
							onclick={creator.openVariablePicker}
						>
							Add variable
						</Button>
					{/snippet}
				</FormatCreateActionBar>
			</section>
		{/if}
	{:else}
		<SplitPane
			primarySide="right"
			minPrimary={FORMAT_CREATOR_SPLIT.minPrimary}
			minSecondary={FORMAT_CREATOR_SPLIT.minSecondary}
			defaultRatio={FORMAT_CREATOR_SPLIT.defaultRatio}
			mobileBreakpoint={FORMAT_CREATOR_SPLIT.mobileBreakpoint}
			keyboardStep={FORMAT_CREATOR_SPLIT.keyboardStep}
			handleWidth={FORMAT_CREATOR_SPLIT.handleWidth}
			label="Resize create format panels"
		>
			{#snippet primary()}
				{#if creator.step === 'starting-point-selection' && formatStarter.startingPointSelection.kind === 'guided'}
					<FormatStarterSelectionPanel
						startingPointSelection={formatStarter.startingPointSelection}
						onAnswersChange={creator.updateAnswers}
						onSubmit={creator.continueToEditor}
					/>
				{:else}
					{#if formatStarter.mode === 'public-data'}
						<aside class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
							<EmailFormatRulePanel
								rules={creator.rulesDraft}
								onRulesChange={creator.updateRules}
								onLinkDataSources={creationDataSourceRequirement
									? openLinkedinContactsModal
									: undefined}
								ruleDataSourceControls={dataSourceControls}
								infoCard={formatStarter.ruleInfoCard}
								canEditRuleText={selectedFormatSpec?.rulesEditPolicy.text ?? false}
								canEditRuleList={selectedFormatSpec?.rulesEditPolicy.list ?? false}
							/>
							<FormatCreateActionBar
								disabled={createFormatDisabled}
								label={createFormatLabel}
								error={createFormatError}
								onPublish={createEmailFormat}
								publishPrerequisiteHint={createFormatPrerequisiteHint}
								contactAttachmentStatus={linkedinContactsAttachmentStatus}
								onOpenContactAttachment={openLinkedinContactsModal}
							/>
						</aside>
					{:else}
						<FormatCreatorEditorSidePanel
							variables={formatStarter.variables}
							dragCoordinator={variableDragCoordinator}
							publishDisabled={createFormatDisabled}
							publishLabel={createFormatLabel}
							publishError={createFormatError}
							onPublish={createEmailFormat}
						/>
					{/if}
				{/if}
			{/snippet}

			{#snippet secondary()}
				<section
					class="relative h-full min-h-0 min-w-0 overflow-hidden bg-white"
					role="group"
					aria-label="FormatStarter creator"
				>
					{#if creator.step === 'starting-point-selection'}
						<div class="absolute inset-0 z-10">
							<FormatStarterOverviewPanel {formatStarter} />
						</div>
					{:else if creator.editor}
						<div class="absolute inset-0 z-10 opacity-100">
							<FormatEmailEditorPanel
								editor={creator.editor}
								variables={formatStarter.variables}
								dragCoordinator={variableDragCoordinator}
								editPolicy={selectedFormatSpec?.contentEditPolicy}
								onVariableInsertionRequestHandled={creator.clearVariableInsertionRequest}
							/>
						</div>
					{/if}
				</section>
			{/snippet}
		</SplitPane>
	{/if}
{/key}

{#if creationDataSourceRequirement?.attachMode === 'upload-new'}
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
