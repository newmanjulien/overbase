<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { api } from '$convex/_generated/api';
	import type { Id } from '$convex/_generated/dataModel';
	import { Pause, Play } from 'lucide-svelte';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { CURRENT_USER_ID } from '$lib/app/current-user';
	import AvatarTeamPicker from '$lib/components/chrome/shared/AvatarTeamPicker.svelte';
	import { Button } from '$lib/components/ui';
	import EmailDraftPanel from '$lib/components/email-draft/EmailDraftPanel.svelte';
	import EmailAttachmentSpreadsheetPreview from '$lib/components/email-draft/EmailAttachmentSpreadsheetPreview.svelte';
	import EmailComposePreview from '$lib/components/email-draft/EmailComposePreview.svelte';
	import SplitPane from '$lib/components/layout/split-pane/SplitPane.svelte';
	import { useRouteTitleState } from '$lib/components/chrome/shared/route-title.svelte';
	import NotificationEmailFeedbackEmptyState from '$lib/features/notifications/detail/NotificationEmailFeedbackEmptyState.svelte';
	import NotificationEmailFeedbackPanel from '$lib/features/notifications/detail/NotificationEmailFeedbackPanel.svelte';
	import NotificationEmailPreviewPanel from '$lib/features/notifications/detail/NotificationEmailPreviewPanel.svelte';
	import NotificationRulesPanel from '$lib/features/notifications/detail/NotificationRulesPanel.svelte';
	import {
		createNotificationDetailState,
		type NotificationEmailFeedback
	} from '$lib/features/notifications/detail/notification-detail-state.svelte';
	import { NOTIFICATION_DETAIL_SPLIT } from '$lib/features/notifications/detail/notification-detail-layout';
	import { areNotificationRulesFilled } from '$lib/features/notifications/detail/notification-detail-rules';
	import { type NotificationEmailItem } from '$lib/features/notifications/detail/notification-detail-types';
	import type { EmailDraft } from '@overbase/builder-sdk/email';

	type DetailView = 'rules' | 'feedback';
	type FeedbackViewState =
		| { kind: 'empty' }
		| {
				kind: 'selected';
				email: NotificationEmailItem;
				feedbackDraft: NotificationEmailFeedback;
				canGoPrevious: boolean;
				canGoNext: boolean;
				canSave: boolean;
		  };

	const routeTitleState = useRouteTitleState();
	const client = useConvexClient();
	const detailState = createNotificationDetailState();
	const notificationId = $derived(page.params.notificationId as Id<'notifications'>);
	const detailQuery = useQuery(api.notifications.getNotificationDetail, () => ({ notificationId }));
	const detail = $derived(detailQuery.data);
	const notification = $derived(detail?.notification ?? null);
	const emails = $derived(detail?.emails ?? []);
	const people = $derived(detail?.people ?? []);
	const readiness = $derived(notification?.readiness ?? null);
	let status = $state<'active' | 'paused'>('paused');
	let detailView = $state<DetailView>('rules');
	let isDeletingNotification = $state(false);
	let isUpdatingStatus = $state(false);
	let isSavingTeamMemberIds = $state(false);
	let hasPendingTeamMemberIdsSave = $state(false);
	let isMobileAttachmentOpen = $state(false);
	let deleteError = $state<string | null>(null);
	let actionError = $state<string | null>(null);
	const detailViewActionLabel = $derived(
		detailView === 'rules' ? 'Give feedback on emails' : 'Set rules'
	);
	const canToggleStatus = $derived(
		Boolean(notification) &&
			!isUpdatingStatus &&
			(status === 'active' || (readiness?.canActivate ?? false))
	);
	const feedbackViewState = $derived(getFeedbackViewState());
	const routeOverflowActions = $derived([
		{
			label: isDeletingNotification ? 'Deleting...' : 'Delete',
			ariaLabel: 'Delete',
			intent: 'destructive' as const,
			disabled: isDeletingNotification,
			onSelect: deleteNotification
		}
	]);

	function getFeedbackViewState(): FeedbackViewState {
		const selectedEmail = emails[detailState.selectedEmailIndex] ?? emails[0];

		if (!selectedEmail) {
			return { kind: 'empty' };
		}

		const feedbackDraft = detailState.getFeedbackDraft(selectedEmail.id);
		return {
			kind: 'selected',
			email: selectedEmail,
			feedbackDraft,
			canGoPrevious: detailState.selectedEmailIndex > 0,
			canGoNext: detailState.selectedEmailIndex < emails.length - 1,
			canSave: detailState.canSaveFeedback(selectedEmail.id)
		};
	}

	function toggleDetailView() {
		detailView = detailView === 'rules' ? 'feedback' : 'rules';
	}

	function showMobileAttachment() {
		isMobileAttachmentOpen = true;
	}

	function closeMobileAttachment() {
		isMobileAttachmentOpen = false;
	}

	function showFeedbackView() {
		detailView = 'feedback';
	}

	function showPreviousEmail() {
		if (feedbackViewState.kind === 'empty' || !feedbackViewState.canGoPrevious) {
			return;
		}

		detailState.selectedEmailIndex -= 1;
	}

	function showNextEmail() {
		if (feedbackViewState.kind === 'empty' || !feedbackViewState.canGoNext) {
			return;
		}

		detailState.selectedEmailIndex += 1;
	}

	function areStringArraysEqual(firstValues: string[], secondValues: string[]) {
		return (
			firstValues.length === secondValues.length &&
			firstValues.every((value, index) => value === secondValues[index])
		);
	}

	async function toggleStatus() {
		if (!canToggleStatus) {
			return;
		}

		const previousStatus = status;
		const nextStatus = status === 'active' ? 'paused' : 'active';
		status = nextStatus;
		actionError = null;
		isUpdatingStatus = true;

		try {
			const result = await client.mutation(api.notifications.setNotificationStatus, {
				notificationId,
				status: nextStatus
			});
			status = result.status;
		} catch (error) {
			status = previousStatus;
			actionError = error instanceof Error ? error.message : 'Could not update notification status.';
		} finally {
			isUpdatingStatus = false;
		}
	}

	async function updateSelectedTeamMemberIds(nextIds: string[]) {
		detailState.updateSelectedTeamMemberIds(nextIds);
		actionError = null;
		hasPendingTeamMemberIdsSave = true;
		await flushTeamMemberIdsSave();
	}

	async function flushTeamMemberIdsSave() {
		if (isSavingTeamMemberIds) {
			return;
		}

		isSavingTeamMemberIds = true;

		try {
			while (hasPendingTeamMemberIdsSave) {
				hasPendingTeamMemberIdsSave = false;
				const requestedTeamMemberIds = [...detailState.selectedTeamMemberIds];

				const result = await client.mutation(api.notifications.setNotificationTeamMembers, {
					notificationId,
					teamMemberIds: requestedTeamMemberIds
				});

				if (areStringArraysEqual(detailState.selectedTeamMemberIds, requestedTeamMemberIds)) {
					detailState.markTeamMembersSaved(result.teamMemberIds, result.updatedAt);
				}
			}
		} catch (error) {
			actionError = error instanceof Error ? error.message : 'Could not update team members.';
		} finally {
			isSavingTeamMemberIds = false;
		}
	}

	async function saveDraft(nextDraft: EmailDraft, baseEmailDraftVersion: number) {
		const result = await client.mutation(api.notifications.saveNotificationEmailDraft, {
			notificationId,
			baseEmailDraftVersion,
			draft: nextDraft
		});

		detailState.markEmailDraftSaved(result.emailDraft, result.emailDraftVersion);
	}

	async function saveTitle(title: string) {
		actionError = null;

		try {
			const result = await client.mutation(api.notifications.updateNotificationTitle, {
				notificationId,
				title
			});
			routeTitleState.title = result.title;
		} catch (error) {
			actionError = error instanceof Error ? error.message : 'Could not update notification title.';
			throw error;
		}
	}

	async function saveRules() {
		actionError = null;

		if (!areNotificationRulesFilled(detailState.rulesDraft)) {
			actionError = 'Add rule text before saving.';
			return;
		}

		try {
			const result = await client.mutation(api.notifications.saveNotificationRules, {
				notificationId,
				rules: detailState.rulesDraft
			});
			detailState.markRulesSaved(result.rules, result.updatedAt);
			status = result.status;
		} catch (error) {
			actionError = error instanceof Error ? error.message : 'Could not save rules.';
		}
	}

	function updateSelectedFeedback(patch: Partial<NotificationEmailFeedback>) {
		if (feedbackViewState.kind === 'empty') {
			return;
		}

		detailState.updateFeedback(feedbackViewState.email.id, patch);
	}

	async function saveSelectedFeedback() {
		if (feedbackViewState.kind === 'empty') {
			return;
		}

		actionError = null;

		try {
			const result = await client.mutation(api.notifications.saveNotificationEmailFeedback, {
				emailId: feedbackViewState.email.id as Id<'notificationEmails'>,
				likedText: feedbackViewState.feedbackDraft.likedText,
				improvementText: feedbackViewState.feedbackDraft.improvementText
			});
			detailState.markFeedbackSaved(feedbackViewState.email.id, result);
		} catch (error) {
			actionError = error instanceof Error ? error.message : 'Could not save feedback.';
		}
	}

	async function deleteNotification() {
		if (isDeletingNotification) {
			return;
		}

		deleteError = null;
		isDeletingNotification = true;

		try {
			await client.mutation(api.notifications.deleteNotifications, {
				notificationIds: [notificationId]
			});
			await goto(resolve('/my-notifications'));
		} catch (error) {
			deleteError = error instanceof Error ? error.message : 'Could not delete notification.';
		} finally {
			isDeletingNotification = false;
		}
	}

	$effect(() => {
		routeTitleState.onTitleChange = saveTitle;
		routeTitleState.actions = routeActions;
		routeTitleState.overflowActions = routeOverflowActions;

		return () => {
			if (routeTitleState.onTitleChange === saveTitle) {
				routeTitleState.onTitleChange = null;
			}

			if (routeTitleState.actions === routeActions) {
				routeTitleState.actions = null;
			}

			if (routeTitleState.overflowActions === routeOverflowActions) {
				routeTitleState.overflowActions = [];
			}
		};
	});

	$effect(() => {
		if (!detail) {
			return;
		}

		routeTitleState.title = detail.notification.title;
		status = detail.notification.status;
		detailState.sync(notificationId, detail, {
			syncTeamMembers: !isSavingTeamMemberIds
		});
	});
</script>

{#snippet routeActions()}
	<div class="flex items-center gap-2">
		<Button
			variant="secondary"
			class="h-7 px-2.5 text-[0.68rem]"
			disabled={!canToggleStatus}
			onclick={() => void toggleStatus()}
		>
			{#snippet leading()}
				{#if status === 'active'}
					<Play class="size-3.5" />
				{:else}
					<Pause class="size-3.5" />
				{/if}
			{/snippet}
			{status === 'active' ? 'Active' : 'Paused'}
		</Button>
		<AvatarTeamPicker
			{people}
			selectedIds={detailState.selectedTeamMemberIds}
			requiredSelectedIds={[CURRENT_USER_ID]}
			onSelectedIdsChange={(nextIds) => void updateSelectedTeamMemberIds(nextIds)}
			altBase="Notification teammate"
			ariaLabel="Manage team members"
			searchPlaceholder="Search team..."
			emptyLabel="No team members found"
		/>
		<Button variant="secondary" class="h-7 px-2.5 text-[0.68rem]" onclick={toggleDetailView}>
			{detailViewActionLabel}
		</Button>
	</div>
{/snippet}

<div class="hidden h-full min-h-0 md:block">
	{#if deleteError || actionError}
		<p class="border-b border-red-100 bg-red-50 px-5 py-2 text-[0.72rem] text-red-700">
			{deleteError ?? actionError}
		</p>
	{/if}
	{#if detailQuery.isLoading}
		<div class="flex h-full items-center justify-center text-[0.74rem] text-zinc-500">
			Loading notification...
		</div>
	{:else if detailQuery.error}
		<div class="flex h-full items-center justify-center text-[0.74rem] text-red-600">
			Could not load notification.
		</div>
	{:else if !detail}
		<div class="flex h-full items-center justify-center text-[0.74rem] text-zinc-500">
			Notification not found.
		</div>
	{:else if detailView === 'feedback' && feedbackViewState.kind === 'empty'}
		<NotificationEmailFeedbackEmptyState />
	{:else}
		<SplitPane
			minPrimary={NOTIFICATION_DETAIL_SPLIT.minPrimary}
			minSecondary={NOTIFICATION_DETAIL_SPLIT.minSecondary}
			defaultRatio={NOTIFICATION_DETAIL_SPLIT.defaultRatio}
			mobileBreakpoint={NOTIFICATION_DETAIL_SPLIT.mobileBreakpoint}
			keyboardStep={NOTIFICATION_DETAIL_SPLIT.keyboardStep}
			handleWidth={NOTIFICATION_DETAIL_SPLIT.handleWidth}
			label="Resize notification detail panels"
		>
			{#snippet primary()}
				{#if detailView === 'rules'}
					<EmailDraftPanel
						draft={detailState.emailDraft}
						emailDraftVersion={detailState.emailDraftVersion}
						canEdit
						onSave={saveDraft}
					/>
				{:else if feedbackViewState.kind === 'selected'}
					<NotificationEmailPreviewPanel
						email={feedbackViewState.email}
						canGoPrevious={feedbackViewState.canGoPrevious}
						canGoNext={feedbackViewState.canGoNext}
						onPrevious={showPreviousEmail}
						onNext={showNextEmail}
					/>
				{/if}
			{/snippet}

			{#snippet secondary()}
				{#if detailView === 'rules'}
					<NotificationRulesPanel
						rules={detailState.rulesDraft}
						canSave={detailState.canSaveRules}
						onRulesChange={detailState.updateRules}
						onSave={() => void saveRules()}
						onGiveEmailFeedback={showFeedbackView}
					/>
				{:else if feedbackViewState.kind === 'selected'}
					<NotificationEmailFeedbackPanel
						likedValue={feedbackViewState.feedbackDraft.likedText}
						improvementValue={feedbackViewState.feedbackDraft.improvementText}
						canSave={feedbackViewState.canSave}
						onLikedValueChange={(nextValue) => {
							updateSelectedFeedback({ likedText: nextValue });
						}}
						onImprovementValueChange={(nextValue) => {
							updateSelectedFeedback({ improvementText: nextValue });
						}}
						onSave={saveSelectedFeedback}
					/>
				{/if}
			{/snippet}
		</SplitPane>
	{/if}
</div>

<div
	class={isMobileAttachmentOpen && detailState.emailDraft.attachment
		? 'h-full min-h-0 bg-white md:hidden'
		: 'min-h-full bg-white px-4 py-4 md:hidden'}
>
	{#if detailQuery.isLoading}
		<div class="flex min-h-60 items-center justify-center text-[0.74rem] text-zinc-500">
			Loading notification...
		</div>
	{:else if detailQuery.error}
		<div class="flex min-h-60 items-center justify-center text-[0.74rem] text-red-600">
			Could not load notification.
		</div>
	{:else if !detail}
		<div class="flex min-h-60 items-center justify-center text-[0.74rem] text-zinc-500">
			Notification not found.
		</div>
	{:else if isMobileAttachmentOpen && detailState.emailDraft.attachment}
		<div class="flex h-full min-h-0 w-full flex-col">
			<EmailAttachmentSpreadsheetPreview
				attachment={detailState.emailDraft.attachment}
				onClose={closeMobileAttachment}
			/>
		</div>
	{:else}
		<div class="space-y-5">
			<section>
				<EmailComposePreview
					draft={detailState.emailDraft}
					onOpenAttachment={showMobileAttachment}
				/>
			</section>

			<section class="border-t border-zinc-100 pt-4">
				<NotificationRulesPanel
					rules={detailState.rulesDraft}
					canSave={detailState.canSaveRules}
					onRulesChange={detailState.updateRules}
					onSave={() => void saveRules()}
				/>
			</section>
		</div>
	{/if}
</div>
