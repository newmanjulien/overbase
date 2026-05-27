<script lang="ts">
	import { page } from '$app/state';
	import type { Id } from '$convex/_generated/dataModel';
	import { EmailFormatDetailPage } from '$lib/features/email-formats/detail';

	const emailFormatId = $derived(page.params.emailFormatId as Id<'emailFormats'>);
</script>

<EmailFormatDetailPage {emailFormatId} />
