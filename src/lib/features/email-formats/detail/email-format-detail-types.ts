import type { EmailDraft } from '$shared/email-drafts';
import type { EmailFormatRule } from '$lib/domain/email-format-rules';

export type EmailFormatRecipientRef =
	| {
			kind: 'user';
			userId: string;
	  }
	| {
			kind: 'teammate';
			teammateId: string;
	  };

export function getFormatRecipientKey(ref: EmailFormatRecipientRef) {
	return ref.kind === 'user' ? `user:${ref.userId}` : `teammate:${ref.teammateId}`;
}

export type { EmailFormatRule };

export type EmailFeedback = {
	likedText: string;
	improvementText: string;
};

export type SentEmail = {
	id: string;
	sentAt: string;
	draft: EmailDraft;
};

export type EmailFormatDetailView = 'rules' | 'feedback';

export type EmailFeedbackViewState =
	| { kind: 'empty' }
	| {
			kind: 'selected';
			sentEmail: SentEmail;
			feedbackDraft: EmailFeedback;
			canGoPrevious: boolean;
			canGoNext: boolean;
			canSave: boolean;
	  };

export type EmailFormatDetailLoadState = 'loading' | 'error' | 'notFound' | 'ready';
