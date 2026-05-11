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
	let deleteError = $state<string | null>(null);
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

	function isDeletingNotification(notificationId: Id<'notifications'>) {
		return deletingNotificationIds.includes(notificationId);
	}

	async function deleteNotifications(notificationIds: Id<'notifications'>[]) {
		const idsToDelete = notificationIds.filter((id) => !isDeletingNotification(id));

		if (idsToDelete.length === 0) {
			return;
		}

		deleteError = null;
		deletingNotificationIds = [...deletingNotificationIds, ...idsToDelete];

		try {
			await client.mutation(api.notifications.deleteNotifications, {
				notificationIds: idsToDelete
			});
		} catch (error) {
			deleteError = error instanceof Error ? error.message : 'Could not delete notifications.';
		} finally {
			deletingNotificationIds = deletingNotificationIds.filter((id) => !idsToDelete.includes(id));
		}
	}

	function toNotificationItem(notification: NotificationListRecord): SelectableListItem {
		const isDeleting = isDeletingNotification(notification.id);

		return {
			id: notification.id,
			title: notification.title,
			descriptionLabel: formatStatus(notification.status),
			metaLabel: dateFormatter.format(new Date(notification.createdAt)),
			creator: {
				name: notification.createdByName,
				avatar: ''
			},
			actionsAriaLabel: 'Notification actions',
			actions: [
				{
					label: isDeleting ? 'Deleting...' : 'Delete',
					ariaLabel: `Delete ${notification.title}`,
					intent: 'destructive',
					disabled: isDeleting,
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
		details:
			'Build your first notification using the notification builder then you will fine tune, add teammates and manage it here',
		learnMoreLabel: 'Learn more'
	}}
	hasItems={listState !== 'empty'}
>
	{#if listState === 'loading'}
		<ListContentState kind="loading" message="Loading notifications..." />
	{:else if listState === 'error'}
		<ListContentState kind="error" message="Could not load notifications." />
	{:else if listState === 'ready'}
		{#if deleteError}
			<p class="border-b border-red-100 bg-red-50 px-4 py-2 text-[0.72rem] text-red-700 md:px-5">
				{deleteError}
			</p>
		{/if}
		<SelectableList
			items={notificationItems}
			selectAllAriaLabel="Select all notifications"
			selectedActionsAriaLabel="Selected notification actions"
			selectedActions={[
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
