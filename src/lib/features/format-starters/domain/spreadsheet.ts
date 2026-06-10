import {
	cloneFormatInline,
	formatVariableToken,
	normalizeFormatInline,
	type FormatInlineNode
} from './inline';
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

const FORMAT_SPREADSHEET_ATTACHMENT_EXTENSION = 'xlsx';

export const FORMAT_SPREADSHEET_ROW_COUNT = SPREADSHEET_ROW_COUNT;
export const FORMAT_SPREADSHEET_COLUMN_COUNT = SPREADSHEET_COLUMN_COUNT;
export const FORMAT_SPREADSHEET_CELL_MAX_LENGTH = SPREADSHEET_CELL_MAX_LENGTH;
export const FORMAT_SPREADSHEET_COLUMN_LABELS = SPREADSHEET_COLUMN_LABELS;

export type FormatSpreadsheetCell = readonly FormatInlineNode[];
export type FormatSpreadsheetAttachment = SpreadsheetAttachment<FormatSpreadsheetCell>;

export function normalizeFormatAttachmentName(value: string) {
	return normalizeSpreadsheetAttachmentFilename(
		value,
		undefined,
		FORMAT_SPREADSHEET_ATTACHMENT_EXTENSION
	);
}

export function createDefaultFormatSpreadsheetAttachment(
	filename?: string
): FormatSpreadsheetAttachment {
	return {
		filename: normalizeFormatAttachmentName(
			filename ?? `Spreadsheet.${FORMAT_SPREADSHEET_ATTACHMENT_EXTENSION}`
		),
		cellsByKey: {},
		formatting: normalizeSpreadsheetFormatting(null)
	};
}

export function cloneFormatAttachment(attachment: FormatSpreadsheetAttachment | null) {
	if (!attachment) {
		return null;
	}

	const cellsByKey: FormatSpreadsheetAttachment['cellsByKey'] = {};

	for (const [key, cell] of Object.entries(attachment.cellsByKey)) {
		const address = parseCellKey(key);

		if (!address) {
			continue;
		}

		cellsByKey[cellKey(address.rowIndex, address.columnIndex)] = cloneFormatInline(cell);
	}

	return {
		filename: attachment.filename,
		cellsByKey,
		formatting: normalizeSpreadsheetFormatting(attachment.formatting)
	};
}

export function normalizeFormatSpreadsheetAttachment(
	attachment: FormatSpreadsheetAttachment | null
): FormatSpreadsheetAttachment | null {
	if (!attachment) {
		return null;
	}

	const filename = normalizeFormatAttachmentName(attachment.filename);

	if (!filename) {
		return null;
	}

	const cellsByKey: FormatSpreadsheetAttachment['cellsByKey'] = {};

	for (const [key, cell] of Object.entries(attachment.cellsByKey)) {
		const address = parseCellKey(key);

		if (!address || cell === undefined) {
			continue;
		}

		const normalizedCell = normalizeFormatSpreadsheetCell(cell);

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

export function normalizeFormatSpreadsheetCell(
	cell: readonly FormatInlineNode[]
): FormatInlineNode[] {
	const normalized = normalizeFormatInline(cell);
	let remainingLength = FORMAT_SPREADSHEET_CELL_MAX_LENGTH;
	const clamped: FormatInlineNode[] = [];

	for (const node of normalized) {
		if (remainingLength <= 0) {
			break;
		}

		if (node.type === 'variable') {
			const tokenLength = formatVariableToken(node.variableId).length;

			if (tokenLength <= remainingLength) {
				clamped.push(node);
				remainingLength -= tokenLength;
			}

			continue;
		}

		const text = node.text.slice(0, remainingLength);

		if (text) {
			clamped.push({
				type: 'text',
				text
			});
			remainingLength -= text.length;
		}
	}

	return normalizeFormatInline(clamped);
}
