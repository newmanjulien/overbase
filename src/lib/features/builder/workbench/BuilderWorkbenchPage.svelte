<script lang="ts">
	import { onDestroy, onMount, untrack } from 'svelte';
	import { useRouteTitleState } from '$lib/app/chrome/shared/route-title.svelte';
	import SplitPane from '$lib/layout/split-pane/SplitPane.svelte';
	import { Button } from '$lib/ui';
	import { watchMediaQuery } from '$lib/ui/viewport';
	import {
		EmailFormatRulePanel,
		LinkDataSourcesModal
	} from '$lib/domain/email-format-rules';
	import type { BuilderRegistryEntry } from '$lib/features/builder/catalog';
	import BuilderActionBar from './layout/BuilderActionBar.svelte';
	import BuilderEditorSidePanel from './layout/BuilderEditorSidePanel.svelte';
	import BuilderEmailEditorPanel from './editor/BuilderEmailEditorPanel.svelte';
	import { BuilderWorkbenchState } from './state/builder-workbench-state.svelte';
	import BuilderOverviewPanel from './layout/BuilderOverviewPanel.svelte';
	import BuilderStartingPointSelectionPanel from './starting-point-selection/BuilderStartingPointSelectionPanel.svelte';
	import BuilderVariablePickerSheet from './variables/BuilderVariablePickerSheet.svelte';
	import { BuilderVariableDragCoordinator } from './variables/builder-variable-drag-coordinator.svelte';
	import { BUILDER_WORKBENCH_SPLIT } from './layout/split-pane';
	import ReconnectLinkedinContactsModal from './reconnect-linkedin/ReconnectLinkedinContactsModal.svelte';

	type Props = {
		builder: BuilderRegistryEntry;
	};

	let { builder }: Props = $props();
	const routeTitleState = useRouteTitleState();
	const workbench = new BuilderWorkbenchState(untrack(() => builder));
	const variableDragCoordinator = new BuilderVariableDragCoordinator();
	const ruleDataSourceModal = $derived(
		builder.mode === 'public-data' ? (builder.ruleDataSourceModal ?? 'default') : 'default'
	);
	let isMobileWorkbench = $state(false);
	let linkDataSourcesModalOpen = $state(false);

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
				<BuilderActionBar>
					{#snippet primary()}
						<Button variant="primary" disabled={true} class="h-10 w-full text-[0.8rem]">
							Publish
						</Button>
					{/snippet}
				</BuilderActionBar>
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
				<BuilderActionBar mobileOrder="secondary-first">
					{#snippet secondary()}
						<Button
							variant="secondary"
							class="h-10 w-full text-[0.8rem]"
							onclick={workbench.openVariablePicker}
						>
							Add variable
						</Button>
					{/snippet}

					{#snippet primary()}
						<Button
							variant="primary"
							disabled={true}
							class="h-10 w-full text-[0.8rem]"
						>
							Publish
						</Button>
					{/snippet}
				</BuilderActionBar>
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
							<BuilderActionBar>
								{#snippet primary()}
									<Button
										variant="primary"
										disabled={true}
										class="h-10 w-full text-[0.8rem] md:h-8 md:w-auto md:text-[0.74rem]"
									>
										Publish
									</Button>
								{/snippet}
							</BuilderActionBar>
						</aside>
					{:else}
						<BuilderEditorSidePanel
							variables={builder.variables}
							dragCoordinator={variableDragCoordinator}
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
		onClose={() => (linkDataSourcesModalOpen = false)}
	/>
{:else}
	<LinkDataSourcesModal
		open={linkDataSourcesModalOpen}
		onClose={() => (linkDataSourcesModalOpen = false)}
	/>
{/if}
