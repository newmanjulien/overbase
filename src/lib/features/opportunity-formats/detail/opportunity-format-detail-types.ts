import type { EmailDraft } from '@overbase/builder-sdk/email';

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
