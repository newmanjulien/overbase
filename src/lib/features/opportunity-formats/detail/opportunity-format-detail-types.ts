import type { EmailDraft } from '@overbase/builder-sdk/email';
import type { Id } from '$convex/_generated/dataModel';

export type FormatRecipientRef =
	| {
			kind: 'user';
			userId: Id<'users'>;
	  }
	| {
			kind: 'teamMember';
			teamMemberId: Id<'teamMembers'>;
	  };

export function getFormatRecipientKey(ref: FormatRecipientRef) {
	return ref.kind === 'user' ? `user:${ref.userId}` : `teamMember:${ref.teamMemberId}`;
}

export type OpportunityFormatRule = {
	id: string;
	text: string;
};

export type OpportunityFeedback = {
	likedText: string;
	improvementText: string;
};

export type OpportunityItem = {
	id: string;
	sentAt: string;
	draft: EmailDraft;
};

export type OpportunityFormatDetailView = 'rules' | 'feedback';

export type OpportunityFeedbackViewState =
	| { kind: 'empty' }
	| {
			kind: 'selected';
			opportunity: OpportunityItem;
			feedbackDraft: OpportunityFeedback;
			canGoPrevious: boolean;
			canGoNext: boolean;
			canSave: boolean;
	  };

export type OpportunityFormatDetailLoadState = 'loading' | 'error' | 'notFound' | 'ready';
