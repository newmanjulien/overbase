import { v } from 'convex/values';
import { emailDraft, emailDraftPatch } from './email-drafts';

export const emailDraftArtifact = v.object({
	id: v.literal('primary'),
	kind: v.literal('emailDraft'),
	version: v.number(),
	visibility: v.union(v.literal('hidden'), v.literal('visible')),
	value: emailDraft
});

export const emailDraftArtifactSet = v.object({
	artifactId: v.literal('primary'),
	kind: v.literal('emailDraft'),
	visibility: v.union(v.literal('hidden'), v.literal('visible')),
	value: emailDraft
});

export const builderArtifacts = v.object({
	primary: v.optional(emailDraftArtifact)
});

export const builderAppState = v.object({
	version: v.number(),
	value: v.any()
});

export const builderGuideSetup = v.object({
	action: v.union(v.literal('submitted'), v.literal('skippedRemaining')),
	answers: v.array(
		v.object({
			questionId: v.string(),
			questionTitle: v.string(),
			answer: v.string()
		})
	)
});

export const builderRunSetup = v.union(
	v.object({
		kind: v.literal('freeform'),
		initialMessage: v.string()
	}),
	v.object({
		kind: v.literal('guided'),
		initialMessage: v.string(),
		guideSetup: builderGuideSetup
	})
);

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
		type: v.literal('artifactSet'),
		artifact: emailDraftArtifactSet
	}),
	v.object({
		type: v.literal('artifactPatch'),
		artifact: v.object({
			artifactId: v.literal('primary'),
			kind: v.literal('emailDraft'),
			patch: v.union(v.null(), emailDraftPatch)
		})
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

export { emailDraft };
