import type { EmailDraft } from '$shared/email-drafts';
import type { Id } from '$convex/_generated/dataModel';
import type { EmailFormatRule } from '$lib/domain/email-format-rules';
import type { BuilderEmailContent } from '$lib/features/builder/domain';

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

export type EmailFormatRecipientPickerPerson = {
	id: string;
	name: string;
	avatarUrl: string;
};

export type { EmailFormatRule };
export type EmailFormatContent = BuilderEmailContent;

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
