<script lang="ts">
	import BuilderChatSurface from '$lib/features/builder-chat/BuilderChatSurface.svelte';
	import type { CustomEmailRunMessage } from '$lib/features/builder-chat/custom-email-run.svelte';

	type Props = {
		messages: CustomEmailRunMessage[];
		queryError?: Error | null;
		runError?: string | null;
		canSendMessage?: boolean;
		onSend: (text: string) => Promise<void>;
	};

	let { messages, queryError = null, runError = null, canSendMessage = true, onSend }: Props =
		$props();
</script>

<BuilderChatSurface {messages} {queryError} {runError} {canSendMessage} {onSend} />
