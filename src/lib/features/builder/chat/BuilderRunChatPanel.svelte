<script lang="ts">
	import BuilderChatSurface from '$lib/features/builder/chat/BuilderChatSurface.svelte';
	import type { BuilderSessionMessage } from '$lib/features/builder/session/builder-session.svelte';

	type Props = {
		messages: BuilderSessionMessage[];
		queryError?: Error | null;
		runError?: string | null;
		canComposeMessage?: boolean;
		canSendMessage?: boolean;
		onSend: (text: string) => Promise<void>;
	};

	let {
		messages,
		queryError = null,
		runError = null,
		canComposeMessage = true,
		canSendMessage = true,
		onSend
	}: Props = $props();
</script>

<BuilderChatSurface
	{messages}
	{queryError}
	{runError}
	{canComposeMessage}
	{canSendMessage}
	{onSend}
/>
