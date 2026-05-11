import type { Doc } from '$convex/_generated/dataModel';

type SessionMessageView = {
	role: 'user' | 'assistant';
	status: 'pending' | 'streaming' | 'complete' | 'failed';
};

export function builderSessionHasActiveAssistant(messages: SessionMessageView[]) {
	return messages.some(
		(message) =>
			message.role === 'assistant' &&
			(message.status === 'pending' || message.status === 'streaming')
	);
}

export function getOptimisticSendingStatus(session: Doc<'builderSessions'>) {
	return session.status === 'waitingForUser' || session.status === 'ready' ? 'working' : session.status;
}

export function getBuilderSessionMessagingView(params: {
	session: Doc<'builderSessions'> | null;
	messages: SessionMessageView[];
	queryError?: Error | null;
	hasHandle: boolean;
}) {
	const hasActiveAssistant = builderSessionHasActiveAssistant(params.messages);
	const hasUsableSession = Boolean(
		params.hasHandle &&
			!params.queryError &&
			params.session &&
			params.session.status !== 'failed' &&
			!params.session.errorText
	);
	const sessionCanAcceptUserMessage =
		params.session?.status === 'waitingForUser' || params.session?.status === 'ready';

	return {
		hasActiveAssistant,
		canEditDraft: hasUsableSession && (sessionCanAcceptUserMessage || hasActiveAssistant),
		canSubmitDraft: hasUsableSession && !hasActiveAssistant && sessionCanAcceptUserMessage
	};
}

export function getBuilderSessionEmailDraftView(session: Doc<'builderSessions'> | null) {
	const emailDraftState =
		session?.emailDraftState?.visibility === 'visible' ? session.emailDraftState : null;
	const emailDraft = emailDraftState?.draft ?? null;
	const canUseReadyEmailDraft = Boolean(
		session &&
			emailDraft &&
			session.status === 'ready' &&
			!session.activeTurnJobId
	);

	return {
		emailDraft,
		emailDraftVersion: emailDraftState?.version ?? 0,
		canEditEmailDraft: canUseReadyEmailDraft,
		canPublishEmailDraft: canUseReadyEmailDraft
	};
}
