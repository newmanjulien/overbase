export const CUSTOM_EMAIL_BUILDER_CARD_ID = 'custom-notification';

export const EMAIL_DRAFT_STATUSES = ['collecting', 'drafting', 'ready'] as const;
export const EMAIL_BODY_BLOCK_TYPES = ['paragraph', 'bullets', 'link'] as const;

export const EMAIL_DRAFT_LIMITS = {
	recipient: 140,
	recipients: 12,
	attachment: 160,
	attachments: 12,
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
	attachments: string[];
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
			type: 'setAttachments';
			attachments: string[];
	  }
	| {
			type: 'setBody';
			body: EmailBodyBlock[];
	  };

export type EmailDraftPatch = {
	operations: EmailDraftPatchOperation[];
};

export type EmailPreviewUpdate = {
	baseArtifactVersion: number;
	status: EmailDraftStatus;
	patch: EmailDraftPatch;
};

export function createDefaultEmailDraft(): EmailDraft {
	return {
		to: [],
		cc: [],
		attachments: [],
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

export function normalizePdfAttachmentName(value: string) {
	const filename = value.trim().split(/[\\/]/).pop() ?? '';
	const withoutQueryOrHash = filename.split(/[?#]/)[0] ?? '';
	const sanitizedBaseName = withoutQueryOrHash
		.replace(/\.[a-z0-9]+$/i, '')
		.replace(/[^a-zA-Z0-9 ._()-]+/g, '_')
		.replace(/\s+/g, ' ')
		.replace(/\.+$/g, '')
		.trim();
	const normalized = clampText(sanitizedBaseName, EMAIL_DRAFT_LIMITS.attachment);

	return normalized ? `${normalized}.pdf` : '';
}

function normalizeAttachments(attachments: string[]) {
	return attachments
		.slice(0, EMAIL_DRAFT_LIMITS.attachments)
		.map(normalizePdfAttachmentName)
		.filter(Boolean);
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
		attachments: normalizeAttachments(draft.attachments),
		body: normalizeEmailBody(draft.body)
	};
}

export function applyEmailDraftPatch(draft: EmailDraft, patch: EmailDraftPatch): EmailDraft {
	const nextDraft: EmailDraft = {
		to: [...draft.to],
		cc: [...draft.cc],
		attachments: [...draft.attachments],
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
			case 'setAttachments':
				nextDraft.attachments = operation.attachments;
				break;
			case 'setBody':
				nextDraft.body = operation.body;
				break;
		}
	}

	return normalizeEmailDraft(nextDraft);
}

export const emailBodyBlockJsonSchema = {
	anyOf: [
		{
			type: 'object',
			additionalProperties: false,
			properties: {
				type: { type: 'string', enum: ['paragraph'] },
				text: {
					type: 'string',
					description: 'A concise email paragraph. Prefer one or two sentences.'
				}
			},
			required: ['type', 'text']
		},
		{
			type: 'object',
			additionalProperties: false,
			properties: {
				type: { type: 'string', enum: ['bullets'] },
				items: {
					type: 'array',
					items: {
						type: 'string',
						description: 'A concise email bullet.'
					},
					maxItems: EMAIL_DRAFT_LIMITS.bulletItems
				}
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
		to: { type: 'array', items: { type: 'string' }, maxItems: EMAIL_DRAFT_LIMITS.recipients },
		cc: { type: 'array', items: { type: 'string' }, maxItems: EMAIL_DRAFT_LIMITS.recipients },
		attachments: {
			type: 'array',
			items: { type: 'string' },
			maxItems: EMAIL_DRAFT_LIMITS.attachments
		},
		body: {
			type: 'array',
			items: emailBodyBlockJsonSchema,
			maxItems: EMAIL_DRAFT_LIMITS.bodyBlocks
		}
	},
	required: ['to', 'cc', 'attachments', 'body']
} as const;

export const emailDraftPatchJsonSchema = {
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
								to: {
									type: 'array',
									items: { type: 'string' },
									maxItems: EMAIL_DRAFT_LIMITS.recipients
								}
							},
							required: ['type', 'to']
						},
					{
						type: 'object',
							additionalProperties: false,
							properties: {
								type: { type: 'string', enum: ['setCc'] },
								cc: {
									type: 'array',
									items: { type: 'string' },
									maxItems: EMAIL_DRAFT_LIMITS.recipients
								}
							},
							required: ['type', 'cc']
						},
					{
						type: 'object',
							additionalProperties: false,
							properties: {
								type: { type: 'string', enum: ['setAttachments'] },
								attachments: {
									type: 'array',
									items: { type: 'string' },
									maxItems: EMAIL_DRAFT_LIMITS.attachments
								}
							},
							required: ['type', 'attachments']
						},
					{
						type: 'object',
							additionalProperties: false,
							properties: {
								type: { type: 'string', enum: ['setBody'] },
								body: {
									type: 'array',
									items: emailBodyBlockJsonSchema,
									maxItems: EMAIL_DRAFT_LIMITS.bodyBlocks
								}
							},
							required: ['type', 'body']
						}
				]
			},
			maxItems: 4
		}
	},
	required: ['operations']
} as const;

export const emailPreviewUpdateJsonSchema = {
	type: 'object',
	additionalProperties: false,
	properties: {
		baseArtifactVersion: { type: 'number' },
		status: {
			type: 'string',
			enum: EMAIL_DRAFT_STATUSES
		},
		patch: emailDraftPatchJsonSchema
	},
	required: ['baseArtifactVersion', 'status', 'patch']
} as const;
