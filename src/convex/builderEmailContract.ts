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

export function createDefaultEmailDraft(): EmailDraft {
	return {
		to: [],
		cc: [],
		subject: '',
		body: []
	};
}

const emailBodyBlockJsonSchema = {
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
