<script lang="ts">
	import { api } from '$convex/_generated/api';
	import { Bell } from 'lucide-svelte';
	import { useQuery } from 'convex-svelte';
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
	const notificationsQuery = useQuery(api.notifications.listNotifications);
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

	function toNotificationItem(notification: NotificationListRecord): SelectableListItem {
		return {
			id: notification.id,
			title: notification.title,
			descriptionLabel: formatStatus(notification.status),
			metaLabel: dateFormatter.format(new Date(notification.createdAt)),
			creator: {
				name: notification.createdByName,
				avatar: ''
			},
			actionsAriaLabel: 'Notification actions'
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
		description: 'Build notifications to track the updates that matter to you.',
		details:
			'My notifications is where your active notification workflows will appear. Build notifications that monitor the data sources and partner activity your team relies on, then manage the updates you receive from this view.',
		learnMoreLabel: 'Learn more'
	}}
	hasItems={listState !== 'empty'}
>
	{#if listState === 'loading'}
		<ListContentState kind="loading" message="Loading notifications..." />
	{:else if listState === 'error'}
		<ListContentState kind="error" message="Could not load notifications." />
	{:else if listState === 'ready'}
		<SelectableList
			items={notificationItems}
			selectAllAriaLabel="Select all notifications"
			selectedActionsAriaLabel="Selected notification actions"
			rowActionsAriaLabel="Notification actions"
		/>
	{/if}
</ListRoutePage>
