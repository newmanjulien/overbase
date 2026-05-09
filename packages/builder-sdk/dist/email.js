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
};
export function createDefaultEmailDraft() {
    return {
        to: [],
        cc: [],
        attachments: [],
        body: []
    };
}
function clampText(value, maxLength) {
    const normalized = value.trim().replace(/\s+/g, ' ');
    return normalized.length > maxLength ? normalized.slice(0, maxLength).trim() : normalized;
}
function clampMultilineText(value, maxLength) {
    const normalized = value.trim();
    return normalized.length > maxLength ? normalized.slice(0, maxLength).trim() : normalized;
}
function normalizeRecipients(recipients) {
    const normalizedRecipients = recipients
        .slice(0, EMAIL_DRAFT_LIMITS.recipients)
        .map((recipient) => clampText(recipient, EMAIL_DRAFT_LIMITS.recipient))
        .filter(Boolean);
    return Array.from(new Set(normalizedRecipients));
}
export function normalizePdfAttachmentName(value) {
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
function normalizeAttachments(attachments) {
    const normalizedAttachments = attachments
        .slice(0, EMAIL_DRAFT_LIMITS.attachments)
        .map(normalizePdfAttachmentName)
        .filter(Boolean);
    return Array.from(new Set(normalizedAttachments));
}
export function normalizeEmailBodyBlock(block) {
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
function normalizeEmailBody(body) {
    return body
        .slice(0, EMAIL_DRAFT_LIMITS.bodyBlocks)
        .map(normalizeEmailBodyBlock)
        .filter((block) => block !== null);
}
export function normalizeEmailDraft(draft) {
    return {
        to: normalizeRecipients(draft.to),
        cc: normalizeRecipients(draft.cc),
        attachments: normalizeAttachments(draft.attachments),
        body: normalizeEmailBody(draft.body)
    };
}
export function hasEmailDraftChanged(before, after) {
    const normalizedBefore = normalizeEmailDraft(before);
    const normalizedAfter = normalizeEmailDraft(after);
    return JSON.stringify(normalizedBefore) !== JSON.stringify(normalizedAfter);
}
export function applyEmailDraftPatch(draft, patch) {
    const nextDraft = {
        to: [...draft.to],
        cc: [...draft.cc],
        attachments: [...draft.attachments],
        body: [...draft.body]
    };
    if (patch.to) {
        nextDraft.to = patch.to;
    }
    if (patch.cc) {
        nextDraft.cc = patch.cc;
    }
    if (patch.attachments) {
        nextDraft.attachments = patch.attachments;
    }
    if (patch.body) {
        nextDraft.body = patch.body;
    }
    return normalizeEmailDraft(nextDraft);
}
export function hasEmailDraftPatchFields(patch) {
    return Boolean(patch &&
        (patch.to !== undefined ||
            patch.cc !== undefined ||
            patch.attachments !== undefined ||
            patch.body !== undefined));
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
};
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
};
export const emailDraftPatchJsonSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        to: {
            type: 'array',
            items: { type: 'string' },
            maxItems: EMAIL_DRAFT_LIMITS.recipients
        },
        cc: {
            type: 'array',
            items: { type: 'string' },
            maxItems: EMAIL_DRAFT_LIMITS.recipients
        },
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
    }
};
//# sourceMappingURL=email.js.map