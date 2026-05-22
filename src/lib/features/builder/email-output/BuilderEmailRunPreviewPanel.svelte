<script lang="ts">
	import type { EmailDraft } from '@overbase/builder-sdk/email';
	import EmailDraftPanel from '$lib/domain/email-drafts/EmailDraftPanel.svelte';

	type Props = {
		draft: EmailDraft;
		emailDraftVersion: number;
		canEdit?: boolean;
		canPublish?: boolean;
		onSave: (draft: EmailDraft, baseEmailDraftVersion: number) => Promise<void>;
		onPublish: () => Promise<void>;
	};

	let {
		draft,
		emailDraftVersion,
		canEdit = false,
		canPublish = false,
		onSave,
		onPublish
	}: Props = $props();

</script>

<EmailDraftPanel
	{draft}
	{emailDraftVersion}
	{canEdit}
	{canPublish}
	onSave={onSave}
	onPublish={onPublish}
/>
