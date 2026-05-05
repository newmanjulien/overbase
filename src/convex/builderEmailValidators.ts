import { v } from 'convex/values';

export const emailDraftStatus = v.union(
	v.literal('collecting'),
	v.literal('drafting'),
	v.literal('ready')
);

export const emailTheme = v.object({
	accentColor: v.string(),
	backgroundColor: v.string(),
	surfaceColor: v.string(),
	textColor: v.string()
});

export const emailBlock = v.union(
	v.object({
		id: v.string(),
		type: v.literal('header'),
		eyebrow: v.string(),
		title: v.string(),
		body: v.string()
	}),
	v.object({
		id: v.string(),
		type: v.literal('summary'),
		title: v.string(),
		body: v.string()
	}),
	v.object({
		id: v.string(),
		type: v.literal('details'),
		title: v.string(),
		items: v.array(
			v.object({
				label: v.string(),
				value: v.string()
			})
		)
	}),
	v.object({
		id: v.string(),
		type: v.literal('table'),
		title: v.string(),
		columns: v.array(v.string()),
		rows: v.array(v.array(v.string()))
	}),
	v.object({
		id: v.string(),
		type: v.literal('cta'),
		label: v.string(),
		description: v.string(),
		buttonLabel: v.string()
	}),
	v.object({
		id: v.string(),
		type: v.literal('footer'),
		body: v.string()
	})
);

export const emailDraft = v.object({
	title: v.string(),
	subject: v.string(),
	previewText: v.string(),
	theme: emailTheme,
	blocks: v.array(emailBlock)
});

export const emailDraftPatchOperation = v.union(
	v.object({
		type: v.literal('setTitle'),
		title: v.string()
	}),
	v.object({
		type: v.literal('setSubject'),
		subject: v.string()
	}),
	v.object({
		type: v.literal('setPreviewText'),
		previewText: v.string()
	}),
	v.object({
		type: v.literal('setTheme'),
		theme: emailTheme
	}),
	v.object({
		type: v.literal('upsertBlock'),
		block: emailBlock
	}),
	v.object({
		type: v.literal('removeBlock'),
		blockId: v.string()
	})
);

export const emailDraftPatch = v.object({
	operations: v.array(emailDraftPatchOperation)
});

export const builderTurnResult = v.object({
	assistantMessage: v.string(),
	nextQuestion: v.union(v.string(), v.null()),
	status: emailDraftStatus,
	baseArtifactVersion: v.number(),
	patch: emailDraftPatch
});
