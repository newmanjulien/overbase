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

export const emailDraft = v.object({
	to: v.array(v.string()),
	cc: v.array(v.string()),
	attachments: v.array(v.string()),
	body: v.array(emailBodyBlock),
	fireReason: v.string()
});

export const emailDraftPatchOperation = v.union(
	v.object({
		type: v.literal('setTo'),
		to: v.array(v.string())
	}),
	v.object({
		type: v.literal('setCc'),
		cc: v.array(v.string())
	}),
	v.object({
		type: v.literal('setAttachments'),
		attachments: v.array(v.string())
	}),
	v.object({
		type: v.literal('setBody'),
		body: v.array(emailBodyBlock)
	}),
	v.object({
		type: v.literal('setFireReason'),
		fireReason: v.string()
	})
);

export const emailDraftPatch = v.object({
	operations: v.array(emailDraftPatchOperation)
});

export const emailDraftChangedField = v.union(
	v.literal('to'),
	v.literal('cc'),
	v.literal('attachments'),
	v.literal('body'),
	v.literal('fireReason')
);
