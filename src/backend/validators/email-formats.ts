import { v } from 'convex/values';

export const emailFormatStatus = v.union(v.literal('active'), v.literal('paused'));
export const emailFormatBuilderMode = v.union(v.literal('internal-data'), v.literal('public-data'));

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

export const emailFormatLinkedinContactInput = v.object({
	firstName: v.string(),
	lastName: v.string(),
	fullName: v.string(),
	company: v.string(),
	position: v.string(),
	profileUrl: v.string(),
	email: v.string(),
	connectedOn: v.string(),
	sourceRowNumber: v.number()
});

export const emailFormatPublishInput = {
	builderSlug: v.string(),
	builderMode: emailFormatBuilderMode,
	startingPointId: v.union(v.string(), v.null()),
	selectedAnswers: v.record(v.string(), v.string()),
	title: v.string(),
	to: v.array(v.string()),
	cc: v.array(v.string()),
	attachment: v.union(emailFormatSpreadsheetAttachment, v.null()),
	body: v.array(emailFormatBodyBlock),
	rules: v.array(emailFormatRule),
	linkedinContactsSource: v.union(
		v.object({
			fileName: v.string(),
			contacts: v.array(emailFormatLinkedinContactInput)
		}),
		v.null()
	)
};
