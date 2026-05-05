import { MAX_MESSAGE_LENGTH } from './conversationCore';

export const CUSTOM_EMAIL_BUILDER_CARD_ID = 'custom-notification';

export const EMAIL_DRAFT_STATUSES = ['collecting', 'drafting', 'ready'] as const;
export const EMAIL_BODY_BLOCK_TYPES = ['paragraph', 'bullets', 'link'] as const;

export const EMAIL_DRAFT_LIMITS = {
	recipient: 140,
	recipients: 12,
	subject: 120,
	bodyBlocks: 12,
	bodyText: 1_000,
	bulletItems: 8,
	linkLabel: 120,
	linkHref: 500
} as const;

export type EmailDraftStatus = (typeof EMAIL_DRAFT_STATUSES)[number];

export type EmailParagraphBlock = {
	type: 'paragraph';
	text: string;
};

export type EmailBulletsBlock = {
	type: 'bullets';
	items: string[];
};

export type EmailLinkBlock = {
	type: 'link';
	label: string;
	href: string;
};

export type EmailBodyBlock = EmailParagraphBlock | EmailBulletsBlock | EmailLinkBlock;

export type EmailDraft = {
	to: string[];
	cc: string[];
	subject: string;
	body: EmailBodyBlock[];
};

export type EmailDraftPatchOperation =
	| {
			type: 'setTo';
			to: string[];
	  }
	| {
			type: 'setCc';
			cc: string[];
	  }
	| {
			type: 'setSubject';
			subject: string;
	  }
	| {
			type: 'setBody';
			body: EmailBodyBlock[];
	  };

export type EmailDraftPatch = {
	operations: EmailDraftPatchOperation[];
};

export type BuilderTurnResult = {
	assistantMessage: string;
	nextQuestion: string | null;
	status: EmailDraftStatus;
	baseArtifactVersion: number;
	patch: EmailDraftPatch;
};

export type EmailPolishTurnResult = {
	assistantMessage: string;
	baseArtifactVersion: number;
	draft: EmailDraft;
};

export function createDefaultEmailDraft(): EmailDraft {
	return {
		to: [],
		cc: [],
		subject: '',
		body: []
	};
}

function clampText(value: string, maxLength: number) {
	const normalized = value.trim().replace(/\s+/g, ' ');

	return normalized.length > maxLength ? normalized.slice(0, maxLength).trim() : normalized;
}

function clampMultilineText(value: string, maxLength: number) {
	const normalized = value.trim();

	return normalized.length > maxLength ? normalized.slice(0, maxLength).trim() : normalized;
}

function normalizeRecipients(recipients: string[]) {
	const normalizedRecipients = recipients
		.slice(0, EMAIL_DRAFT_LIMITS.recipients)
		.map((recipient) => clampText(recipient, EMAIL_DRAFT_LIMITS.recipient))
		.filter(Boolean);

	return Array.from(new Set(normalizedRecipients));
}

export function normalizeEmailBodyBlock(block: EmailBodyBlock): EmailBodyBlock | null {
	switch (block.type) {
		case 'paragraph': {
			const text = clampMultilineText(block.text, EMAIL_DRAFT_LIMITS.bodyText);

			return text ? { type: 'paragraph', text } : null;
		}
		case 'bullets': {
			const items = block.items
				.slice(0, EMAIL_DRAFT_LIMITS.bulletItems)
				.map((item) => clampMultilineText(item, EMAIL_DRAFT_LIMITS.bodyText))
				.filter(Boolean);

			return items.length > 0 ? { type: 'bullets', items } : null;
		}
		case 'link': {
			const label = clampText(block.label, EMAIL_DRAFT_LIMITS.linkLabel);
			const href = clampText(block.href, EMAIL_DRAFT_LIMITS.linkHref);

			return label && href ? { type: 'link', label, href } : null;
		}
	}
}

function normalizeEmailBody(body: EmailBodyBlock[]) {
	return body
		.slice(0, EMAIL_DRAFT_LIMITS.bodyBlocks)
		.map(normalizeEmailBodyBlock)
		.filter((block): block is EmailBodyBlock => block !== null);
}

export function normalizeEmailDraft(draft: EmailDraft): EmailDraft {
	return {
		to: normalizeRecipients(draft.to),
		cc: normalizeRecipients(draft.cc),
		subject: clampText(draft.subject, EMAIL_DRAFT_LIMITS.subject),
		body: normalizeEmailBody(draft.body)
	};
}

export function applyEmailDraftPatch(draft: EmailDraft, patch: EmailDraftPatch): EmailDraft {
	const nextDraft: EmailDraft = {
		to: [...draft.to],
		cc: [...draft.cc],
		subject: draft.subject,
		body: [...draft.body]
	};

	for (const operation of patch.operations) {
		switch (operation.type) {
			case 'setTo':
				nextDraft.to = operation.to;
				break;
			case 'setCc':
				nextDraft.cc = operation.cc;
				break;
			case 'setSubject':
				nextDraft.subject = operation.subject;
				break;
			case 'setBody':
				nextDraft.body = operation.body;
				break;
		}
	}

	return normalizeEmailDraft(nextDraft);
}

function normalizeQuestionForComparison(value: string) {
	return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function shouldAppendNextQuestion(assistantMessage: string, nextQuestion: string) {
	const normalizedAssistantMessage = normalizeQuestionForComparison(assistantMessage);
	const normalizedNextQuestion = normalizeQuestionForComparison(nextQuestion);

	return normalizedNextQuestion.length > 0 && !normalizedAssistantMessage.includes(normalizedNextQuestion);
}

export function buildBuilderAssistantText(turn: BuilderTurnResult) {
	const assistantMessage = turn.assistantMessage.trim();
	const nextQuestion = turn.nextQuestion?.trim() ?? '';
	const text =
		nextQuestion && shouldAppendNextQuestion(assistantMessage, nextQuestion)
			? `${assistantMessage}\n\n${nextQuestion}`
			: assistantMessage;

	return clampMultilineText(text, MAX_MESSAGE_LENGTH);
}

export function buildPolishAssistantText(turn: EmailPolishTurnResult) {
	return clampMultilineText(turn.assistantMessage, MAX_MESSAGE_LENGTH);
}

export const emailBodyBlockJsonSchema = {
	anyOf: [
		{
			type: 'object',
			additionalProperties: false,
			properties: {
				type: { type: 'string', enum: ['paragraph'] },
				text: { type: 'string' }
			},
			required: ['type', 'text']
		},
		{
			type: 'object',
			additionalProperties: false,
			properties: {
				type: { type: 'string', enum: ['bullets'] },
				items: { type: 'array', items: { type: 'string' } }
			},
			required: ['type', 'items']
		},
		{
			type: 'object',
			additionalProperties: false,
			properties: {
				type: { type: 'string', enum: ['link'] },
				label: { type: 'string' },
				href: { type: 'string' }
			},
			required: ['type', 'label', 'href']
		}
	]
} as const;

export const emailDraftJsonSchema = {
	type: 'object',
	additionalProperties: false,
	properties: {
		to: { type: 'array', items: { type: 'string' } },
		cc: { type: 'array', items: { type: 'string' } },
		subject: { type: 'string' },
		body: { type: 'array', items: emailBodyBlockJsonSchema }
	},
	required: ['to', 'cc', 'subject', 'body']
} as const;

export const builderTurnResultJsonSchema = {
	type: 'object',
	additionalProperties: false,
	properties: {
		assistantMessage: { type: 'string' },
		nextQuestion: {
			anyOf: [{ type: 'string' }, { type: 'null' }]
		},
		status: {
			type: 'string',
			enum: EMAIL_DRAFT_STATUSES
		},
		baseArtifactVersion: { type: 'number' },
		patch: {
			type: 'object',
			additionalProperties: false,
			properties: {
				operations: {
					type: 'array',
					items: {
						anyOf: [
							{
								type: 'object',
								additionalProperties: false,
								properties: {
									type: { type: 'string', enum: ['setTo'] },
									to: { type: 'array', items: { type: 'string' } }
								},
								required: ['type', 'to']
							},
							{
								type: 'object',
								additionalProperties: false,
								properties: {
									type: { type: 'string', enum: ['setCc'] },
									cc: { type: 'array', items: { type: 'string' } }
								},
								required: ['type', 'cc']
							},
							{
								type: 'object',
								additionalProperties: false,
								properties: {
									type: { type: 'string', enum: ['setSubject'] },
									subject: { type: 'string' }
								},
								required: ['type', 'subject']
							},
							{
								type: 'object',
								additionalProperties: false,
								properties: {
									type: { type: 'string', enum: ['setBody'] },
									body: { type: 'array', items: emailBodyBlockJsonSchema }
								},
								required: ['type', 'body']
							}
						]
					}
				}
			},
			required: ['operations']
		}
	},
	required: ['assistantMessage', 'nextQuestion', 'status', 'baseArtifactVersion', 'patch']
} as const;

export const emailPolishTurnResultJsonSchema = {
	type: 'object',
	additionalProperties: false,
	properties: {
		assistantMessage: { type: 'string' },
		baseArtifactVersion: { type: 'number' },
		draft: emailDraftJsonSchema
	},
	required: ['assistantMessage', 'baseArtifactVersion', 'draft']
} as const;
