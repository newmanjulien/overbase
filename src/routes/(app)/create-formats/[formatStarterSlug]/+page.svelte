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
	import { FormatCreatorState } from '$lib/features/format-starters/creator/state/format-creator-state.svelte';
	import FormatStarterSelectionPanel from '$lib/features/format-starters/creator/starting-point-selection/FormatStarterSelectionPanel.svelte';
	import { FormatVariableDragCoordinator } from '$lib/features/format-starters/creator/variables/format-variable-drag-coordinator.svelte';
	import { FORMAT_CREATOR_SPLIT } from '$lib/features/format-starters/creator/layout/split-pane';
	import ReconnectLinkedinContactsModal from '$lib/features/format-starters/creator/reconnect-linkedin/ReconnectLinkedinContactsModal.svelte';
	import type { ContactImport } from '$lib/features/external-data/linkedin-contacts-csv';
	import {
		getEmailFormatCreationDataSourceRequirement
	} from '$domain/email-formats/data-source-requirements';
	import FormatCreatorDesktopPrimaryPanel from '$lib/features/format-starters/creator/layout/FormatCreatorDesktopPrimaryPanel.svelte';
	import FormatCreatorDesktopSecondaryPanel from '$lib/features/format-starters/creator/layout/FormatCreatorDesktopSecondaryPanel.svelte';
	import FormatCreatorMobileInternalData from '$lib/features/format-starters/creator/layout/FormatCreatorMobileInternalData.svelte';
	import FormatCreatorMobilePublicData from '$lib/features/format-starters/creator/layout/FormatCreatorMobilePublicData.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const client = useConvexClient();
	const viewerSession = useViewerSession();
	const routeTitleState = useRouteTitleState();
	const formatStarter = $derived(data.formatStarter);
	let creator = $state<FormatCreatorState | null>(
		untrack(() => (data.formatStarter ? new FormatCreatorState(data.formatStarter) : null))
	);
	const editorRoute = $derived(
		formatStarter && creator ? { formatStarter, creator } : null
	);
	const variableDragCoordinator = new FormatVariableDragCoordinator();
	const viewerUserId = $derived(viewerSession.viewer?.user._id ?? null);
	const selectedFormatSpec = $derived(creator?.selectedFormatSpec ?? null);
	const titleEditable = $derived(Boolean(selectedFormatSpec?.contentEditPolicy.title));
	const creationDataSourceRequirement = $derived(
		selectedFormatSpec ? getEmailFormatCreationDataSourceRequirement(selectedFormatSpec) : null
	);
	const uploadNewCreationDataSourceRequirement = $derived(
		creationDataSourceRequirement?.attachMode === 'upload-new'
			? creationDataSourceRequirement
			: null
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
		Boolean(uploadNewCreationDataSourceRequirement)
	);
	const dataSourceActions = $derived(
		(creator?.dataSourceActions ?? [])
			.filter((action) => action.ruleId === uploadNewCreationDataSourceRequirement?.ruleId)
			.map((action) =>
				linkedinContactsImport && uploadNewCreationDataSourceRequirement
					? {
							...action,
							label: uploadNewCreationDataSourceRequirement.linkedLabel,
							disabled: true
						}
					: action
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
			!creator?.canCreateFormat ||
			(requiresLinkedinContactsBeforeCreate && !linkedinContactsImport)
	);
	const createFormatLabel = $derived(creatingFormat ? 'Creating...' : 'Create format');
	const createActionProps = $derived({
		createFormatDisabled,
		createFormatLabel,
		createFormatError,
		createFormatPrerequisiteHint,
		linkedinContactsAttachmentStatus,
		onOpenLinkedinContactsModal: openLinkedinContactsModal,
		onCreateEmailFormat: createEmailFormat
	});

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
		if (!formatStarter) {
			creator = null;
			return;
		}

		if (!creator) {
			creator = new FormatCreatorState(formatStarter);
			return;
		}

		creator.syncFormatStarter(formatStarter);
	});

	$effect(() => {
		if (!formatStarter) {
			return;
		}

		if (createFormatStateFormatStarterSlug !== formatStarter.slug) {
			createFormatStateFormatStarterSlug = formatStarter.slug;
			creatingFormat = false;
			createFormatError = null;
			linkedinContactsImport = null;
		}
	});

	$effect(() => {
		if (!formatStarter) {
			routeTitleState.editable = false;
			routeTitleState.onTitleChange = null;
			return;
		}

		const updateTitle = (nextTitle: string) => {
			if (!creator) {
				return;
			}

			creator.updateTitle(nextTitle);
			routeTitleState.title = creator.title;
		};

		routeTitleState.editable = titleEditable;
		routeTitleState.onTitleChange = titleEditable && creator ? updateTitle : null;

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
		if (!formatStarter) {
			routeTitleState.title = 'Format not found';
			return;
		}

		if (creator) {
			routeTitleState.title = creator.title;
		}
	});

	function getErrorMessage(error: unknown) {
		return error instanceof Error ? error.message : 'Could not create email format.';
	}

	function openLinkedinContactsModal() {
		if (uploadNewCreationDataSourceRequirement) {
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
		if (creatingFormat || !creator) {
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

<section class="flex h-full min-h-full w-full px-0 py-0 md:px-0 md:py-0">
	<div class="min-h-0 min-w-0 flex-1">
		{#if editorRoute}
			{@const formatStarter = editorRoute.formatStarter}
			{@const creator = editorRoute.creator}
			{#key formatStarter.slug}
				{#if isMobileCreator}
					{#if creator.step === 'starting-point-selection' && formatStarter.startingPointSelection.kind === 'guided'}
						<FormatStarterSelectionPanel
							startingPointSelection={formatStarter.startingPointSelection}
							onAnswersChange={creator.updateAnswers}
							onSubmit={creator.continueToEditor}
						/>
					{:else if creator.editor && formatStarter.mode === 'public-data'}
						<FormatCreatorMobilePublicData
							editor={creator.editor}
							rules={creator.rulesDraft}
							onRulesChange={creator.updateRules}
							{formatStarter}
							{selectedFormatSpec}
							{variableDragCoordinator}
							creationDataSourceRequirement={uploadNewCreationDataSourceRequirement}
							{dataSourceActions}
							{...createActionProps}
						/>
					{:else if creator.editor && formatStarter.mode === 'internal-data'}
						<FormatCreatorMobileInternalData
							editor={creator.editor}
							variablePickerOpen={creator.variablePickerOpen}
							variableInsertionRequest={creator.variableInsertionRequest}
							onVariableInsertionRequest={creator.requestVariableInsertion}
							onVariablePickerOpen={creator.openVariablePicker}
							onVariablePickerClose={creator.closeVariablePicker}
							onVariableInsertionRequestHandled={creator.clearVariableInsertionRequest}
							{formatStarter}
							{variableDragCoordinator}
							{...createActionProps}
						/>
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
								<FormatCreatorDesktopPrimaryPanel
									rules={creator.rulesDraft}
									onRulesChange={creator.updateRules}
									{formatStarter}
									{selectedFormatSpec}
									{variableDragCoordinator}
									creationDataSourceRequirement={uploadNewCreationDataSourceRequirement}
									{dataSourceActions}
									{...createActionProps}
								/>
							{/if}
						{/snippet}

						{#snippet secondary()}
							{#if creator.step === 'starting-point-selection'}
								<FormatCreatorDesktopSecondaryPanel
									step="starting-point-selection"
									{formatStarter}
								/>
							{:else if creator.editor}
								<FormatCreatorDesktopSecondaryPanel
									step="editor"
									editor={creator.editor}
									{formatStarter}
									{selectedFormatSpec}
									{variableDragCoordinator}
									onVariableInsertionRequestHandled={creator.clearVariableInsertionRequest}
								/>
							{/if}
						{/snippet}
					</SplitPane>
				{/if}
			{/key}
		{:else if !formatStarter}
			<div class="flex h-full min-h-full items-center justify-center bg-white px-6 py-12">
				<div class="w-full max-w-sm rounded-sm border border-stone-200 bg-white p-5 text-center shadow-sm">
					<p class="text-sm font-medium text-stone-950">Format not found</p>
					<p class="mt-2 text-xs leading-relaxed text-stone-500">
						Choose a format from the gallery to start a local draft.
					</p>
					<Button
						variant="primary"
						href={APP_LINKS.createFormats.pathname}
						class="mt-4 rounded-full text-xs"
					>
						Back to create formats
					</Button>
				</div>
			</div>
		{/if}
	</div>
</section>

{#if editorRoute}
	{#if uploadNewCreationDataSourceRequirement}
		<ReconnectLinkedinContactsModal
			open={linkDataSourcesModalOpen}
			contactsImport={linkedinContactsImport}
			onClose={() => (linkDataSourcesModalOpen = false)}
			onContactsImported={acceptLinkedinContactsImport}
		/>
	{/if}
{/if}
