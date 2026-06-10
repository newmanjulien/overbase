import {
	SPREADSHEET_CELL_MAX_LENGTH,
	SPREADSHEET_COLUMN_COUNT,
	SPREADSHEET_COLUMN_LABELS,
	SPREADSHEET_ROW_COUNT,
	cellKey,
	normalizeSpreadsheetFormatting,
	normalizeSpreadsheetAttachmentFilename,
	parseCellKey,
	type SpreadsheetAttachment
} from '$domain/spreadsheets';

export const EMAIL_DRAFT_LIMITS = {
	recipient: 140,
	recipients: 12,
	attachmentFilename: 160,
	spreadsheetColumns: SPREADSHEET_COLUMN_COUNT,
	spreadsheetRows: SPREADSHEET_ROW_COUNT,
	spreadsheetCell: SPREADSHEET_CELL_MAX_LENGTH,
	bodyBlocks: 12,
	bodyText: 1_000,
	linkLabel: 120,
	linkHref: 500
} as const;

export const EMAIL_ATTACHMENT_FORMAT = {
	extension: 'xlsx',
	shortLabel: 'XLSX',
	label: 'Excel workbook'
} as const;

export { SPREADSHEET_COLUMN_LABELS };

export type EmailParagraphBlock = {
	type: 'paragraph';
	text: string;
};

export type EmailLinkBlock = {
	type: 'link';
	label: string;
	href: string;
};

export type EmailBodyBlock = EmailParagraphBlock | EmailLinkBlock;

export type EmailSpreadsheetAttachment = SpreadsheetAttachment<string>;

export type EmailDraft = {
	to: string[];
	cc: string[];
	attachment: EmailSpreadsheetAttachment | null;
	body: EmailBodyBlock[];
};

export function createDefaultEmailDraft(): EmailDraft {
	return {
		to: [],
		cc: [],
		attachment: null,
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

export function normalizeEmailAttachmentName(value: string) {
	return normalizeSpreadsheetAttachmentFilename(
		value,
		EMAIL_DRAFT_LIMITS.attachmentFilename,
		EMAIL_ATTACHMENT_FORMAT.extension
	);
}

export function createDefaultEmailSpreadsheetAttachment(
	filename = `Spreadsheet.${EMAIL_ATTACHMENT_FORMAT.extension}`
): EmailSpreadsheetAttachment {
	return {
		filename: normalizeEmailAttachmentName(filename),
		cellsByKey: {},
		formatting: normalizeSpreadsheetFormatting(null)
	};
}

export function normalizeEmailSpreadsheetCell(value: string) {
	return clampText(value, EMAIL_DRAFT_LIMITS.spreadsheetCell);
}

export function normalizeEmailSpreadsheetAttachment(
	attachment: EmailSpreadsheetAttachment | null
): EmailSpreadsheetAttachment | null {
	if (!attachment) {
		return null;
	}

	const filename = normalizeEmailAttachmentName(attachment.filename);

	if (!filename) {
		return null;
	}

	const cellsByKey: EmailSpreadsheetAttachment['cellsByKey'] = {};

	for (const [key, cell] of Object.entries(attachment.cellsByKey)) {
		const address = parseCellKey(key);

		if (!address || cell === undefined) {
			continue;
		}

		const normalizedCell = normalizeEmailSpreadsheetCell(cell);

		if (normalizedCell.length > 0) {
			cellsByKey[cellKey(address.rowIndex, address.columnIndex)] = normalizedCell;
		}
	}

	return {
		filename,
		cellsByKey,
		formatting: normalizeSpreadsheetFormatting(attachment.formatting)
	};
}

function normalizeEmailBodyBlock(block: EmailBodyBlock): EmailBodyBlock | null {
	if (block.type === 'paragraph') {
		const text = clampMultilineText(block.text, EMAIL_DRAFT_LIMITS.bodyText);

		return text ? { type: 'paragraph', text } : null;
	}

	const label = clampText(block.label, EMAIL_DRAFT_LIMITS.linkLabel);
	const href = clampText(block.href, EMAIL_DRAFT_LIMITS.linkHref);

	return label && href ? { type: 'link', label, href } : null;
}

export function normalizeEmailDraft(draft: EmailDraft): EmailDraft {
	return {
		to: normalizeRecipients(draft.to),
		cc: normalizeRecipients(draft.cc),
		attachment: normalizeEmailSpreadsheetAttachment(draft.attachment),
		body: draft.body
			.slice(0, EMAIL_DRAFT_LIMITS.bodyBlocks)
			.map(normalizeEmailBodyBlock)
			.filter((block): block is EmailBodyBlock => block !== null)
	};
}
