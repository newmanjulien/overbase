<script lang="ts">
	import { api } from '$convex/_generated/api';
	import type { Id } from '$convex/_generated/dataModel';
	import { Bell } from 'lucide-svelte';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import {
		ListContentState,
		ListRoutePage,
		SelectableList
	} from '$lib/components/list-page';
	import { InfoBar } from '$lib/components/ui';
	import NotificationListRow from './NotificationListRow.svelte';
	import type { NotificationListItem } from './notification-list';

	const dateFormatter = new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
	const client = useConvexClient();
	const notificationsQuery = useQuery(api.notifications.listNotifications);
	let deletingNotificationIds = $state<Id<'notifications'>[]>([]);
	let pausingNotificationIds = $state<Id<'notifications'>[]>([]);
	let actionError = $state<string | null>(null);
	const notificationItems = $derived((notificationsQuery.data ?? []).map(toNotificationItem));
	const listState = $derived(
		notificationsQuery.isLoading
			? 'loading'
			: notificationsQuery.error
				? 'error'
				: notificationItems.length === 0
					? 'empty'
					: 'ready'
	);

	type NotificationListRecord = NonNullable<typeof notificationsQuery.data>[number];

	function formatStatus(status: NotificationListRecord['status']) {
		return status === 'active' ? 'Active' : 'Paused';
	}

	function getStatusLabelClass(status: NotificationListRecord['status']) {
		return status === 'active' ? 'text-zinc-400' : 'text-red-300';
	}

	function isDeletingNotification(notificationId: Id<'notifications'>) {
		return deletingNotificationIds.includes(notificationId);
	}

	function isPausingNotification(notificationId: Id<'notifications'>) {
		return pausingNotificationIds.includes(notificationId);
	}

	function getActiveNotificationIds(notificationIds: Id<'notifications'>[]) {
		const notificationIdSet = new Set(notificationIds);

		return (notificationsQuery.data ?? [])
			.filter(
				(notification) => notificationIdSet.has(notification.id) && notification.status === 'active'
			)
			.map((notification) => notification.id);
	}

	async function deleteNotifications(notificationIds: Id<'notifications'>[]) {
		const idsToDelete = notificationIds.filter((id) => !isDeletingNotification(id));

		if (idsToDelete.length === 0) {
			return;
		}

		actionError = null;
		deletingNotificationIds = [...deletingNotificationIds, ...idsToDelete];

		try {
			await client.mutation(api.notifications.deleteNotifications, {
				notificationIds: idsToDelete
			});
		} catch (error) {
			actionError = error instanceof Error ? error.message : 'Could not delete notifications.';
		} finally {
			deletingNotificationIds = deletingNotificationIds.filter((id) => !idsToDelete.includes(id));
		}
	}

	async function pauseNotifications(notificationIds: Id<'notifications'>[]) {
		const idsToPause = getActiveNotificationIds(notificationIds).filter(
			(id) => !isPausingNotification(id) && !isDeletingNotification(id)
		);

		if (idsToPause.length === 0) {
			return;
		}

		actionError = null;
		pausingNotificationIds = [...pausingNotificationIds, ...idsToPause];

		try {
			for (const notificationId of idsToPause) {
				await client.mutation(api.notifications.setNotificationStatus, {
					notificationId,
					status: 'paused'
				});
			}
		} catch (error) {
			actionError = error instanceof Error ? error.message : 'Could not pause notifications.';
		} finally {
			pausingNotificationIds = pausingNotificationIds.filter((id) => !idsToPause.includes(id));
		}
	}

	function selectedNotificationsIncludeActive(selectedNotificationIds: string[]) {
		return getActiveNotificationIds(selectedNotificationIds as Id<'notifications'>[]).length > 0;
	}

	function toNotificationItem(notification: NotificationListRecord): NotificationListItem {
		const isDeleting = isDeletingNotification(notification.id);
		const isPausing = isPausingNotification(notification.id);
		const actionsDisabled = isDeleting || isPausing;
		const actions: NotificationListItem['actions'] = [
			{
				label: isDeleting ? 'Deleting...' : 'Delete',
				ariaLabel: `Delete ${notification.title}`,
				intent: 'destructive' as const,
				disabled: actionsDisabled,
				onSelect: () => deleteNotifications([notification.id])
			}
		];

		if (notification.status === 'active') {
			actions.unshift({
				label: isPausing ? 'Updating...' : 'Pause',
				ariaLabel: `Pause ${notification.title}`,
				disabled: actionsDisabled,
				onSelect: () => pauseNotifications([notification.id])
			});
		}

		return {
			id: notification.id,
			title: notification.title,
			href: `/my-notifications/${notification.id}`,
			selectAriaLabel: `Select ${notification.title}`,
			statusLabel: formatStatus(notification.status),
			statusLabelClass: getStatusLabelClass(notification.status),
			createdAtLabel: dateFormatter.format(new Date(notification.createdAt)),
			creator: {
				name: notification.createdByName,
				avatar: ''
			},
			actionsAriaLabel: 'Notification actions',
			actions
		};
	}
</script>

<ListRoutePage
	toolbar={{
		searchPlaceholder: 'Search notifications...',
		searchAriaLabel: 'Search notifications',
		filterLabel: 'All notifications'
	}}
	empty={{
		icon: Bell,
		title: 'No notifications found',
		description: 'Build your first notification with the notification builder.',
		nextSteps: [
			{ kind: 'link', text: 'Build', href: '/builder' },
			{
				kind: 'text',
				text: ' your first notification using the notification builder then you will fine tune, add teammates and manage it here'
			}
		],
		learnMoreLabel: 'Learn more'
	}}
	hasItems={listState !== 'empty'}
>
	{#if listState === 'loading'}
		<ListContentState kind="loading" message="Loading notifications..." />
	{:else if listState === 'error'}
		<ListContentState kind="error" message="Could not load notifications." />
	{:else if listState === 'ready'}
		{#if actionError}
			<p class="border-b border-red-100 bg-red-50 px-4 py-2 text-[0.72rem] text-red-700 md:px-5">
				{actionError}
			</p>
		{/if}
		<SelectableList
			items={notificationItems}
			selectAllAriaLabel="Select all notifications"
			selectedActionsAriaLabel="Selected notification actions"
			selectedActions={[
				{
					label: pausingNotificationIds.length > 0 ? 'Updating...' : 'Pause selected',
					ariaLabel: 'Pause selected notifications',
					disabled: (selectedNotificationIds) =>
						pausingNotificationIds.length > 0 ||
						!selectedNotificationsIncludeActive(selectedNotificationIds),
					onSelect: (selectedNotificationIds) =>
						pauseNotifications(selectedNotificationIds as Id<'notifications'>[])
				},
				{
					label: deletingNotificationIds.length > 0 ? 'Deleting...' : 'Delete',
					ariaLabel: 'Delete selected notifications',
					intent: 'destructive',
					disabled: deletingNotificationIds.length > 0,
					onSelect: (selectedNotificationIds) =>
						deleteNotifications(selectedNotificationIds as Id<'notifications'>[])
				}
			]}
			rowActionsAriaLabel="Notification actions"
		>
			{#snippet rowCells(item)}
				<NotificationListRow {item} />
			{/snippet}
		</SelectableList>
	{/if}

	{#snippet footer()}
		{#if listState === 'ready'}
			<InfoBar label="Next steps:">
				Click on your notification to set the rules for when it should fire and to configure which teammates should receive it
			</InfoBar>
		{/if}
	{/snippet}
</ListRoutePage>
