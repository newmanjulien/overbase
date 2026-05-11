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
	import type { SelectableListItem } from '$lib/components/list-page';

	const dateFormatter = new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
	const client = useConvexClient();
	const notificationsQuery = useQuery(api.notifications.listNotifications);
	let deletingNotificationIds = $state<Id<'notifications'>[]>([]);
	let statusUpdatingNotificationIds = $state<Id<'notifications'>[]>([]);
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

	function isStatusUpdatingNotification(notificationId: Id<'notifications'>) {
		return statusUpdatingNotificationIds.includes(notificationId);
	}

	function getNotificationsWithStatus(
		notificationIds: Id<'notifications'>[],
		status: NotificationListRecord['status']
	) {
		const notificationIdSet = new Set(notificationIds);

		return (notificationsQuery.data ?? [])
			.filter((notification) => notificationIdSet.has(notification.id) && notification.status === status)
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

	async function setNotificationStatuses(
		notificationIds: Id<'notifications'>[],
		status: NotificationListRecord['status']
	) {
		const idsToUpdate = getNotificationsWithStatus(
			notificationIds,
			status === 'active' ? 'paused' : 'active'
		).filter((id) => !isStatusUpdatingNotification(id) && !isDeletingNotification(id));

		if (idsToUpdate.length === 0) {
			return;
		}

		actionError = null;
		statusUpdatingNotificationIds = [...statusUpdatingNotificationIds, ...idsToUpdate];

		try {
			await client.mutation(api.notifications.setNotificationStatuses, {
				notificationIds: idsToUpdate,
				status
			});
		} catch (error) {
			actionError =
				error instanceof Error ? error.message : 'Could not update notification statuses.';
		} finally {
			statusUpdatingNotificationIds = statusUpdatingNotificationIds.filter(
				(id) => !idsToUpdate.includes(id)
			);
		}
	}

	function selectedNotificationsIncludeStatus(
		selectedNotificationIds: string[],
		status: NotificationListRecord['status']
	) {
		return getNotificationsWithStatus(selectedNotificationIds as Id<'notifications'>[], status).length > 0;
	}

	function toNotificationItem(notification: NotificationListRecord): SelectableListItem {
		const isDeleting = isDeletingNotification(notification.id);
		const isStatusUpdating = isStatusUpdatingNotification(notification.id);
		const actionsDisabled = isDeleting || isStatusUpdating;
		const targetStatus = notification.status === 'active' ? 'paused' : 'active';

		return {
			id: notification.id,
			title: notification.title,
			descriptionLabel: formatStatus(notification.status),
			descriptionLabelClass: getStatusLabelClass(notification.status),
			metaLabel: dateFormatter.format(new Date(notification.createdAt)),
			creator: {
				name: notification.createdByName,
				avatar: ''
			},
			actionsAriaLabel: 'Notification actions',
			actions: [
				{
					label: isStatusUpdating
						? 'Updating...'
						: notification.status === 'active'
							? 'Pause'
							: 'Unpause',
					ariaLabel: `${notification.status === 'active' ? 'Pause' : 'Unpause'} ${notification.title}`,
					disabled: actionsDisabled,
					onSelect: () => setNotificationStatuses([notification.id], targetStatus)
				},
				{
					label: isDeleting ? 'Deleting...' : 'Delete',
					ariaLabel: `Delete ${notification.title}`,
					intent: 'destructive',
					disabled: actionsDisabled,
					onSelect: () => deleteNotifications([notification.id])
				}
			]
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
					label: statusUpdatingNotificationIds.length > 0 ? 'Updating...' : 'Pause selected',
					ariaLabel: 'Pause selected notifications',
					disabled: (selectedNotificationIds) =>
						statusUpdatingNotificationIds.length > 0 ||
						!selectedNotificationsIncludeStatus(selectedNotificationIds, 'active'),
					onSelect: (selectedNotificationIds) =>
						setNotificationStatuses(selectedNotificationIds as Id<'notifications'>[], 'paused')
				},
				{
					label: statusUpdatingNotificationIds.length > 0 ? 'Updating...' : 'Unpause selected',
					ariaLabel: 'Unpause selected notifications',
					disabled: (selectedNotificationIds) =>
						statusUpdatingNotificationIds.length > 0 ||
						!selectedNotificationsIncludeStatus(selectedNotificationIds, 'paused'),
					onSelect: (selectedNotificationIds) =>
						setNotificationStatuses(selectedNotificationIds as Id<'notifications'>[], 'active')
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
		/>
	{/if}
</ListRoutePage>
