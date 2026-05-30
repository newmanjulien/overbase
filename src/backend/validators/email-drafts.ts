import { v } from 'convex/values';

export const emailBodyBlock = v.union(
	v.object({
		type: v.literal('paragraph'),
		text: v.string()
	}),
	v.object({
		type: v.literal('bullets'),
		items: v.array(v.string())
	}),
	v.object({
		type: v.literal('link'),
		label: v.string(),
		href: v.string()
	})
);

export const emailSpreadsheetAttachment = v.object({
	filename: v.string(),
	cells: v.array(v.array(v.string()))
});

export const emailDraft = v.object({
	to: v.array(v.string()),
	cc: v.array(v.string()),
	attachment: v.union(v.null(), emailSpreadsheetAttachment),
	body: v.array(emailBodyBlock)
});
