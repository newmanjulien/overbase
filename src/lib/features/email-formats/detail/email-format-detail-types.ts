import type { EmailDraft } from '@overbase/builder-sdk/email';
import type { Id } from '$convex/_generated/dataModel';

export type EmailFormatRecipientRef =
	| {
			kind: 'user';
			userId: Id<'users'>;
	  }
	| {
			kind: 'teammate';
			teammateId: Id<'teammates'>;
	  };

export function getFormatRecipientKey(ref: EmailFormatRecipientRef) {
	return ref.kind === 'user' ? `user:${ref.userId}` : `teammate:${ref.teammateId}`;
}

export type EmailFormatRule = {
	id: string;
	text: string;
};

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
