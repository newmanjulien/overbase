import { v } from 'convex/values';
import {
	externalDataSourceId,
	externalDataImport,
	linkedinContactsExternalDataImport
} from './external-data';

export const emailFormatStatus = v.union(v.literal('active'), v.literal('paused'));
export const emailFormatDataMode = v.union(v.literal('internal-data'), v.literal('public-data'));

export const emailFormatInlineNode = v.union(
	v.object({
		type: v.literal('text'),
		text: v.string()
	}),
	v.object({
		type: v.literal('variable'),
		variableId: v.string()
	})
);

export const emailFormatBodyBlock = v.object({
	id: v.string(),
	type: v.literal('paragraph'),
	content: v.array(emailFormatInlineNode)
});

export const emailFormatSpreadsheetAttachment = v.object({
	filename: v.string(),
	cellsByKey: v.record(v.string(), v.array(emailFormatInlineNode))
});

export const emailFormatRule = v.object({
	id: v.string(),
	text: v.string()
});

export const emailFormatVariableDefinition = v.object({
	id: v.string(),
	label: v.string()
});

export const emailFormatId = v.id('emailFormats');

export const emailFormatRecipientRef = v.union(
	v.object({ kind: v.literal('user'), userId: v.id('users') }),
	v.object({ kind: v.literal('teammate'), teammateId: v.id('teammates') })
);

export const emailFormatCreateFromStarterInput = {
	formatDefinitionSlug: v.string(),
	createdFromStarterSlug: v.string(),
	variantSlug: v.string(),
	variables: v.array(emailFormatVariableDefinition),
	selectedAnswers: v.record(v.string(), v.string()),
	title: v.string(),
	to: v.array(v.string()),
	cc: v.array(v.string()),
	attachment: v.union(emailFormatSpreadsheetAttachment, v.null()),
	body: v.array(emailFormatBodyBlock),
	recipientRefs: v.array(emailFormatRecipientRef),
	rules: v.array(emailFormatRule),
	externalDataImport
};

export const addLinkedinContactsSourceToEmailFormatRuleInput = {
	emailFormatId,
	ruleId: v.string(),
	externalDataImport: linkedinContactsExternalDataImport
};

export const linkExternalDataSourceToEmailFormatRuleInput = {
	emailFormatId,
	ruleId: v.string(),
	externalDataSourceId
};

export const updateEmailFormatContentInput = {
	emailFormatId,
	baseEmailContentVersion: v.number(),
	to: v.array(v.string()),
	cc: v.array(v.string()),
	attachment: v.union(emailFormatSpreadsheetAttachment, v.null()),
	body: v.array(emailFormatBodyBlock)
};

export const updateEmailFormatTitleInput = {
	emailFormatId,
	baseTitleVersion: v.number(),
	title: v.string()
};

export const updateEmailFormatRulesInput = {
	emailFormatId,
	baseRulesVersion: v.number(),
	rules: v.array(emailFormatRule)
};

export const updateEmailFormatRecipientsInput = {
	emailFormatId,
	recipientRefs: v.array(emailFormatRecipientRef)
};

export const setEmailFormatStatusInput = {
	emailFormatId,
	status: emailFormatStatus
};

export const deleteEmailFormatsInput = {
	emailFormatIds: v.array(emailFormatId)
};
