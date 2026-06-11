import type { EmailDraft } from '$lib/features/email-formats/drafts/email-drafts';
import type { Id } from '$convex/_generated/dataModel';
import type { EmailFormatRule } from '$lib/features/email-formats/rules';
import type { FormatEmailContent } from '$lib/features/format-starters/domain';
import type {
	EmailFormatContentEditPolicy,
	EmailFormatInlineTextContent,
	EmailFormatRulesEditPolicy,
	EmailFormatVariableDefinition
} from '$domain/email-formats';

export type EmailFormatRecipientRef =
	| {
			kind: 'admin';
			adminId: Id<'admins'>;
	  }
	| {
			kind: 'teamMember';
			teamMemberId: Id<'teamMembers'>;
	  };

export function getFormatRecipientKey(ref: EmailFormatRecipientRef) {
	return ref.kind === 'admin'
		? `admin:${ref.adminId}`
		: `teamMember:${ref.teamMemberId}`;
}

export type EmailFormatRecipientPickerPerson = {
	id: string;
	name: string;
	avatarUrl: string;
};

export type { EmailFormatRule };
export type EmailFormatContent = Omit<FormatEmailContent, 'title'>;

export type EmailFormatConfig = {
	slug: string;
	variables: readonly EmailFormatVariableDefinition[];
	contentEditPolicy: EmailFormatContentEditPolicy;
	rulesEditPolicy: EmailFormatRulesEditPolicy;
	ruleInfoCard: {
		label: string;
		content: EmailFormatInlineTextContent;
	} | null;
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

export type EmailFormatConfigureView = 'rules' | 'feedback';

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

export type EmailFormatConfigureLoadState = 'loading' | 'error' | 'notFound' | 'ready';
