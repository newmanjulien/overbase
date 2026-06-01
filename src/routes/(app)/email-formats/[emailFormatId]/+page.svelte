<script lang="ts">
	import { api } from '$convex/_generated/api';
	import type { Id } from '$convex/_generated/dataModel';
	import { useRouteTitleState } from '$lib/app/chrome/shared/route-title.svelte';
	import { FormatVariableDragCoordinator } from '$lib/features/format-starters/creator/variables/format-variable-drag-coordinator.svelte';
	import EmailFormatConfigureDesktop from '$lib/features/email-formats/configure/EmailFormatConfigureDesktop.svelte';
	import EmailFormatHeaderActions from '$lib/features/email-formats/configure/EmailFormatHeaderActions.svelte';
	import EmailFormatConfigureMobile from '$lib/features/email-formats/configure/EmailFormatConfigureMobile.svelte';
	import {
		createTimedNotice,
		getActivationSuccessMessage
	} from '$lib/features/email-formats/configure/email-format-activation-notices.svelte';
	import {
		createEmailFormatConfigureState,
		type EmailFormatConfigureState
	} from '$lib/features/email-formats/configure/email-format-configure-state.svelte';
	import type {
		EmailFeedback,
		EmailFeedbackViewState,
		EmailFormatContent,
		EmailFormatConfigureLoadState,
		EmailFormatConfigureView,
		SentEmail
	} from '$lib/features/email-formats/configure/email-format-configure-types';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { onDestroy, untrack } from 'svelte';
	import {
		getEmailFormatActivationMissingMessageFromError,
		getEmailFormatActivationReadiness
	} from '$shared/email-format-activation';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const client = useConvexClient();
	const routeTitleState = useRouteTitleState();
	const emailFormatId = $derived(data.emailFormatId as Id<'emailFormats'>);
	const configureState: EmailFormatConfigureState = createEmailFormatConfigureState();
	const dragCoordinator = new FormatVariableDragCoordinator();
	const configureQuery = useQuery(api.emailFormats.getEmailFormatConfiguration, () => ({
		emailFormatId
	}));
	let configureView = $state<EmailFormatConfigureView>('rules');
	let actionError = $state<string | null>(null);
	let contentError = $state<string | null>(null);
	let isSavingRecipients = $state(false);
	let isUpdatingStatus = $state(false);
	const activationSuccessNotice = createTimedNotice();

	const loadState = $derived.by<EmailFormatConfigureLoadState>(() => {
		if (configureQuery.isLoading) {
			return 'loading';
		}

		if (configureQuery.error) {
			return 'error';
		}

		return configureQuery.data ? 'ready' : 'notFound';
	});
	const recipientPickerPeople = $derived(configureQuery.data?.recipientPickerPeople ?? []);
	const emailFormatStatus = $derived(configureQuery.data?.emailFormat.status ?? null);
	const lastActivatedAt = $derived(configureQuery.data?.emailFormat.lastActivatedAt ?? null);
	const formatDefinition = $derived(configureQuery.data?.formatDefinition ?? null);
	const contentVariables = $derived(formatDefinition?.variables ?? []);
	const contentEditPolicy = $derived(formatDefinition?.contentEditPolicy ?? null);
	const rulesEditPolicy = $derived(formatDefinition?.rulesEditPolicy ?? null);
	const ruleDataSourceAction = $derived(formatDefinition?.ruleDataSourceAction ?? undefined);
	const ruleInfoCard = $derived(formatDefinition?.ruleInfoCard ?? null);
	const titleEditable = $derived(Boolean(contentEditPolicy?.title));
	const activationReadiness = $derived.by(() =>
		emailFormatStatus === 'paused'
			? getEmailFormatActivationReadiness({
					recipientCount: configureState.savedRecipientRefs.length,
					rules: configureState.savedRules
				})
			: null
	);
	const activationBlockerMessage = $derived(activationReadiness?.message ?? null);
	const activationReadyMessage = $derived(
		activationReadiness?.canActivate && lastActivatedAt === null
			? "This format is ready to activate. Click on the 'Paused' button"
			: null
	);
	const statusToggleDisabled = $derived(Boolean(activationBlockerMessage));
	const sentEmails = $derived((configureQuery.data?.sentEmails ?? []) as SentEmail[]);
	const feedbackViewState = $derived.by<EmailFeedbackViewState>(() => {
		const sentEmail = sentEmails[configureState.selectedSentEmailIndex];

		if (!sentEmail) {
			return { kind: 'empty' };
		}

		return {
			kind: 'selected',
			sentEmail,
			feedbackDraft: configureState.getFeedbackDraft(sentEmail.id),
			canGoPrevious: configureState.selectedSentEmailIndex > 0,
			canGoNext: configureState.selectedSentEmailIndex < sentEmails.length - 1,
			canSave: configureState.canSaveFeedback(sentEmail.id)
		};
	});

	$effect(() => {
		const configure = configureQuery.data;
		const currentEmailFormatId = emailFormatId;

		if (configure) {
			untrack(() => {
				configureState.sync(currentEmailFormatId, configure);
				routeTitleState.title = configureState.titleDraft;
			});
		}
	});

	$effect(() => {
		if (emailFormatId) {
			untrack(activationSuccessNotice.clear);
		}
	});

	$effect(() => {
		const saveTitle = async (nextTitle: string) => {
			configureState.updateTitleDraft(nextTitle);

			if (!configureQuery.data) {
				return;
			}

			await saveTitleDraft({
				rethrow: true
			});
		};

		routeTitleState.editable = titleEditable;
		routeTitleState.onTitleChange = titleEditable ? saveTitle : null;
		routeTitleState.actions = headerActions;

		return () => {
			if (routeTitleState.onTitleChange === saveTitle) {
				routeTitleState.onTitleChange = null;
			}
			if (routeTitleState.editable === titleEditable) {
				routeTitleState.editable = null;
			}
			if (routeTitleState.actions === headerActions) {
				routeTitleState.actions = null;
			}
		};
	});

	onDestroy(() => {
		dragCoordinator.endDrag();
		activationSuccessNotice.destroy();
	});

	function showActivationSuccessNotice() {
		activationSuccessNotice.show(getActivationSuccessMessage());
	}

	function getContentSaveError(error: unknown) {
		return error instanceof Error ? error.message : 'Could not save email format.';
	}

	function toEmailContentInput(content: EmailFormatContent) {
		return {
			to: [...content.to],
			cc: [...content.cc],
			attachment: content.attachment
				? {
						filename: content.attachment.filename,
						cellsByKey: Object.fromEntries(
							Object.entries(content.attachment.cellsByKey).map(([key, cell]) => [
								key,
								cell.map((node) => ({ ...node }))
							])
						)
					}
				: null,
			body: content.body.map((block) => ({
				id: block.id,
				type: block.type,
				content: block.content.map((node) => ({ ...node }))
			}))
		};
	}

	async function saveTitleDraft({
		rethrow = false,
		overwriteConflict = false
	}: { rethrow?: boolean; overwriteConflict?: boolean } = {}) {
		if (!configureQuery.data || configureState.isSavingTitle) {
			return;
		}

		actionError = null;
		configureState.isSavingTitle = true;

		try {
			const result = await client.mutation(api.emailFormats.updateEmailFormatTitle, {
				emailFormatId,
				baseTitleVersion: configureState.getTitleSaveVersion({ overwriteConflict }),
				title: configureState.titleDraft
			});

			if (result.kind === 'stale') {
				configureState.syncTitleRemote(result.title);
				routeTitleState.title = configureState.titleDraft;
				return;
			}

			configureState.markTitleSaved(result.title);
			routeTitleState.title = result.title.value;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Could not save title.';
			actionError = message;
			if (configureQuery.data) {
				configureState.sync(emailFormatId, configureQuery.data);
			}

			if (rethrow && !configureState.titleConflict) {
				throw error;
			}
		} finally {
			configureState.isSavingTitle = false;
		}
	}

	async function saveContent({
		rethrow = false,
		overwriteConflict = false
	}: { rethrow?: boolean; overwriteConflict?: boolean } = {}) {
		if (!configureQuery.data) {
			return;
		}

		const contentDraft = configureState.emailContentDraft;

		if (!contentDraft) {
			return;
		}

		if (configureState.isSavingContent) {
			const error = new Error('Email format is already saving.');
			contentError = error.message;
			actionError = error.message;

			if (rethrow) {
				throw error;
			}
			return;
		}

		actionError = null;
		contentError = null;
		configureState.isSavingContent = true;

		try {
			const contentInput = toEmailContentInput(contentDraft);
			const result = await client.mutation(api.emailFormats.updateEmailFormatContent, {
				emailFormatId,
				baseEmailContentVersion: configureState.getContentSaveVersion({ overwriteConflict }),
				...contentInput
			});

			if (result.kind === 'stale') {
				configureState.syncContentRemote(result.emailContent);
				return;
			}

			configureState.markContentSaved(result.emailContent);
		} catch (error) {
			const message = getContentSaveError(error);
			contentError = message;
			actionError = message;
			if (configureQuery.data) {
				configureState.sync(emailFormatId, configureQuery.data);
			}

			if (rethrow) {
				throw error;
			}
		} finally {
			configureState.isSavingContent = false;
		}
	}

	async function saveRules({ overwriteConflict = false } = {}) {
		if (configureState.isSavingRules) {
			return;
		}

		actionError = null;
		configureState.isSavingRules = true;

		try {
			const result = await client.mutation(api.emailFormats.updateEmailFormatRules, {
				emailFormatId,
				baseRulesVersion: configureState.getRulesSaveVersion({ overwriteConflict }),
				rules: configureState.rulesDraft
			});

			if (result.kind === 'stale') {
				configureState.syncRulesRemote(result.rules);
				return;
			}

			configureState.markRulesSaved(result.rules);
		} catch (error) {
			actionError = error instanceof Error ? error.message : 'Could not save rules.';
			if (configureQuery.data) {
				configureState.sync(emailFormatId, configureQuery.data);
			}
		} finally {
			configureState.isSavingRules = false;
		}
	}

	async function saveRecipients(nextRefs = configureState.selectedRecipientRefs) {
		if (isSavingRecipients) {
			return;
		}

		const previousRefs = configureState.selectedRecipientRefs;
		actionError = null;
		configureState.updateSelectedRecipientRefs(nextRefs);
		isSavingRecipients = true;

		try {
			const result = await client.mutation(api.emailFormats.updateEmailFormatRecipients, {
				emailFormatId,
				recipientRefs: nextRefs
			});
			configureState.markRecipientsSaved(result.recipientRefs, result.updatedAt);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Could not save recipients.';
			actionError = message;
			configureState.updateSelectedRecipientRefs(previousRefs);
		} finally {
			isSavingRecipients = false;
		}
	}

	async function toggleStatus() {
		if (!emailFormatStatus || isUpdatingStatus) {
			return;
		}

		const nextStatus = emailFormatStatus === 'active' ? 'paused' : 'active';

		if (nextStatus === 'active' && activationReadiness && !activationReadiness.canActivate) {
			actionError = null;
			activationSuccessNotice.clear();
			return;
		}

		actionError = null;
		activationSuccessNotice.clear();
		isUpdatingStatus = true;

		try {
			await client.mutation(api.emailFormats.setEmailFormatStatus, {
				emailFormatId,
				status: nextStatus
			});
			if (nextStatus === 'active') {
				showActivationSuccessNotice();
			}
		} catch (error) {
			actionError =
				(nextStatus === 'active'
					? getEmailFormatActivationMissingMessageFromError(error)
					: null) ??
				(error instanceof Error
					? error.message
					: `Could not ${nextStatus === 'active' ? 'activate' : 'pause'} email format.`);
		} finally {
			isUpdatingStatus = false;
		}
	}

	function updateFeedback(patch: Partial<EmailFeedback>) {
		if (feedbackViewState.kind === 'selected') {
			configureState.updateFeedback(feedbackViewState.sentEmail.id, patch);
		}
	}

	function saveFeedback() {
		if (feedbackViewState.kind === 'selected') {
			configureState.markFeedbackSaved(
				feedbackViewState.sentEmail.id,
				feedbackViewState.feedbackDraft
			);
		}
	}

	function showPreviousSentEmail() {
		configureState.selectedSentEmailIndex = Math.max(0, configureState.selectedSentEmailIndex - 1);
	}

	function showNextSentEmail() {
		configureState.selectedSentEmailIndex = Math.min(
			sentEmails.length - 1,
			configureState.selectedSentEmailIndex + 1
		);
	}

	function keepMineTitle() {
		return saveTitleDraft({ overwriteConflict: true });
	}

	function useLatestTitle() {
		configureState.useLatestTitle();
		routeTitleState.title = configureState.titleDraft;
		actionError = null;
	}

	function keepMineContent() {
		return saveContent({ overwriteConflict: true });
	}

	function useLatestContent() {
		configureState.useLatestContent();
		contentError = null;
		actionError = null;
	}

	function keepMineRules() {
		return saveRules({ overwriteConflict: true });
	}

	function useLatestRules() {
		configureState.useLatestRules();
		actionError = null;
	}
</script>

{#snippet headerActions()}
	<EmailFormatHeaderActions
		status={emailFormatStatus}
		people={recipientPickerPeople}
		selectedRecipientRefs={configureState.selectedRecipientRefs}
		{isSavingRecipients}
		{isUpdatingStatus}
		{statusToggleDisabled}
		onSelectedRecipientRefsChange={saveRecipients}
		onToggleStatus={toggleStatus}
	/>
{/snippet}

<EmailFormatConfigureDesktop
	{actionError}
	deleteError={null}
	{configureState}
	{configureView}
	{feedbackViewState}
	{activationBlockerMessage}
	{activationReadyMessage}
	activationSuccessMessage={activationSuccessNotice.message}
	{contentError}
	{contentEditPolicy}
	{contentVariables}
	{dragCoordinator}
	{loadState}
	{ruleDataSourceAction}
	{ruleInfoCard}
	{rulesEditPolicy}
	onFeedbackChange={updateFeedback}
	onKeepMineContent={keepMineContent}
	onKeepMineRules={keepMineRules}
	onKeepMineTitle={keepMineTitle}
	onSaveContent={saveContent}
	onSaveFeedback={saveFeedback}
	onSaveRules={saveRules}
	onShowNextSentEmail={showNextSentEmail}
	onShowPreviousSentEmail={showPreviousSentEmail}
	onUseLatestContent={useLatestContent}
	onUseLatestRules={useLatestRules}
	onUseLatestTitle={useLatestTitle}
/>

<EmailFormatConfigureMobile
	{actionError}
	{activationBlockerMessage}
	{activationReadyMessage}
	activationSuccessMessage={activationSuccessNotice.message}
	{contentError}
	{contentEditPolicy}
	{contentVariables}
	{configureState}
	{dragCoordinator}
	{loadState}
	{ruleDataSourceAction}
	{ruleInfoCard}
	{rulesEditPolicy}
	onKeepMineContent={keepMineContent}
	onKeepMineRules={keepMineRules}
	onKeepMineTitle={keepMineTitle}
	onSaveContent={saveContent}
	onSaveRules={saveRules}
	onUseLatestContent={useLatestContent}
	onUseLatestRules={useLatestRules}
	onUseLatestTitle={useLatestTitle}
/>
