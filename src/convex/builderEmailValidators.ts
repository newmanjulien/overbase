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

export const builderAppState = v.object({
	version: v.number(),
	value: v.any()
});

export const builderAppOutputEvent = v.union(
	v.object({
		type: v.literal('assistantDelta'),
		text: v.string()
	}),
	v.object({
		type: v.literal('assistantComplete'),
		text: v.string()
	}),
	v.object({
		type: v.literal('emailDraftReplace'),
		emailDraft,
		visible: v.optional(v.boolean())
	}),
	v.object({
		type: v.literal('emailDraftPatch'),
		patch: v.union(v.null(), emailDraftPatch),
		patchIntent: v.union(v.literal('none'), v.literal('noop'), v.literal('meaningful'))
	}),
	v.object({
		type: v.literal('appStateReplace'),
		appState: builderAppState
	}),
	v.object({
		type: v.literal('appStatePatch'),
		patch: v.any()
	}),
	v.object({
		type: v.literal('enqueueBackgroundJob')
	}),
	v.object({
		type: v.literal('waitForUser')
	}),
	v.object({
		type: v.literal('complete')
	}),
	v.object({
		type: v.literal('fail'),
		errorText: v.string()
	})
);
