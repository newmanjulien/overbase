import type { EmailDraft } from '$shared/email-drafts';
import type { Id } from '$convex/_generated/dataModel';
import type { EmailFormatRule } from '$lib/domain/email-format-rules';
import type { FormatEmailContent } from '$lib/features/format-starters/domain';
import type {
	EmailFormatContentEditPolicy,
	EmailFormatInlineTextContent,
	EmailFormatRuleDataSourceAction,
	EmailFormatRulesEditPolicy,
	EmailFormatVariableDefinition
} from '$shared/email-format-definitions';

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
export type EmailFormatContent = Omit<FormatEmailContent, 'title'>;

export type EmailFormatDefinitionConfigure = {
	slug: string;
	dataMode: 'internal-data' | 'public-data';
	variables: readonly EmailFormatVariableDefinition[];
	contentEditPolicy: EmailFormatContentEditPolicy;
	rulesEditPolicy: EmailFormatRulesEditPolicy;
	ruleDataSourceAction: EmailFormatRuleDataSourceAction;
	ruleDataSourceModal: 'default' | 'reconnect-linkedin';
	requiredLinkedinContactsRuleId: string | null;
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
