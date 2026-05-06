<script lang="ts">
	import { api } from '$convex/_generated/api';
	import type { Id } from '$convex/_generated/dataModel';
	import { useQuery } from 'convex-svelte';
	import BuilderChatSurface from '$lib/features/builder-chat/BuilderChatSurface.svelte';

	type Props = {
		conversationId: Id<'conversations'>;
		resumeToken: string;
		onSend: (text: string) => Promise<void>;
	};

	let { conversationId, resumeToken, onSend }: Props = $props();

	const messagesQuery = useQuery(api.chat.listMessages, () => ({ conversationId, resumeToken }));
	const messages = $derived(messagesQuery.data ?? []);
	const hasPendingAssistant = $derived(
		messages.some((message) => message.role === 'assistant' && message.status === 'pending')
	);
</script>

<BuilderChatSurface
	{messages}
	queryError={messagesQuery.error ?? null}
	canSendMessage={!hasPendingAssistant}
	{onSend}
/>
