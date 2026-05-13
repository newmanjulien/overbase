<script lang="ts">
	import { page } from '$app/state';
	import type { Id } from '$convex/_generated/dataModel';
	import { NotificationDetailPage } from '$lib/features/notifications/detail';

	const notificationId = $derived(page.params.notificationId as Id<'notifications'>);
</script>

<NotificationDetailPage {notificationId} />
