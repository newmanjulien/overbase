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
	body: v.array(emailBodyBlock)
});

export const emailDraftPatch = v.object({
	to: v.optional(v.array(v.string())),
	cc: v.optional(v.array(v.string())),
	attachments: v.optional(v.array(v.string())),
	body: v.optional(v.array(emailBodyBlock))
});

export const emailDraftState = v.object({
	version: v.number(),
	visibility: v.union(v.literal('hidden'), v.literal('visible')),
	draft: emailDraft
});

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
		type: v.literal('emailDraftSet'),
		emailDraft,
		visibility: v.union(v.literal('hidden'), v.literal('visible'))
	}),
	v.object({
		type: v.literal('emailDraftPatch'),
		patch: v.union(v.null(), emailDraftPatch)
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
