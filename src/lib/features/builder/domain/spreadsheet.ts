import {
	cloneBuilderInline,
	formatBuilderVariableToken,
	normalizeBuilderInline,
	type BuilderInlineNode
} from './inline';
import {
	SPREADSHEET_CELL_MAX_LENGTH,
	SPREADSHEET_COLUMN_COUNT,
	SPREADSHEET_COLUMN_LABELS,
	SPREADSHEET_ROW_COUNT,
	cellKey,
	parseCellKey,
	type SpreadsheetCellKey
} from '$shared/spreadsheets';

const BUILDER_ATTACHMENT_FILENAME_MAX_LENGTH = 160;
const BUILDER_SPREADSHEET_ATTACHMENT_EXTENSION = 'xlsx';

export const BUILDER_SPREADSHEET_ROW_COUNT = SPREADSHEET_ROW_COUNT;
export const BUILDER_SPREADSHEET_COLUMN_COUNT = SPREADSHEET_COLUMN_COUNT;
export const BUILDER_SPREADSHEET_CELL_MAX_LENGTH = SPREADSHEET_CELL_MAX_LENGTH;
export const BUILDER_SPREADSHEET_COLUMN_LABELS = SPREADSHEET_COLUMN_LABELS;

export type BuilderSpreadsheetCell = readonly BuilderInlineNode[];

export type BuilderSpreadsheetAttachment = {
	filename: string;
	cellsByKey: Record<SpreadsheetCellKey, BuilderSpreadsheetCell>;
};

export function normalizeBuilderAttachmentName(value: string) {
	const withoutQueryOrHash = value.trim().split(/[?#]/)[0] ?? '';
	const filename = withoutQueryOrHash.split(/[\\/]/).pop() ?? '';
	const baseName = filename.replace(/\.[^.]+$/i, '');
	const sanitizedBaseName = baseName
		.replace(/[^a-zA-Z0-9 ._()-]+/g, '_')
		.replace(/\s+/g, ' ')
		.replace(/\.+$/g, '')
		.trim();
	const normalized = clampSingleLineText(sanitizedBaseName, BUILDER_ATTACHMENT_FILENAME_MAX_LENGTH);

	return normalized ? `${normalized}.${BUILDER_SPREADSHEET_ATTACHMENT_EXTENSION}` : '';
}

export function createDefaultBuilderSpreadsheetAttachment(
	filename?: string
): BuilderSpreadsheetAttachment {
	return normalizeBuilderSpreadsheetAttachment({
		filename: filename ?? `Spreadsheet.${BUILDER_SPREADSHEET_ATTACHMENT_EXTENSION}`,
		cellsByKey: {}
	})!;
}

export function cloneBuilderAttachment(attachment: BuilderSpreadsheetAttachment | null) {
	return attachment
		? {
				filename: attachment.filename,
				cellsByKey: Object.fromEntries(
					Object.entries(attachment.cellsByKey).map(([key, cell]) => [
						key,
						cloneBuilderInline(cell)
					])
				) as Record<SpreadsheetCellKey, BuilderSpreadsheetCell>
			}
		: null;
}

export function normalizeBuilderSpreadsheetAttachment(
	attachment: BuilderSpreadsheetAttachment | null
): BuilderSpreadsheetAttachment | null {
	if (!attachment) {
		return null;
	}

	const filename = normalizeBuilderAttachmentName(attachment.filename);

	if (!filename) {
		return null;
	}

	const cellsByKey: Record<SpreadsheetCellKey, BuilderSpreadsheetCell> = {};

	for (const [key, cell] of Object.entries(attachment.cellsByKey)) {
		const address = parseCellKey(key);

		if (!address) {
			continue;
		}

		const normalizedCell = normalizeBuilderSpreadsheetCell(cell);

		if (normalizedCell.length > 0) {
			cellsByKey[cellKey(address.rowIndex, address.columnIndex)] = normalizedCell;
		}
	}

	return {
		filename,
		cellsByKey
	};
}

export function normalizeBuilderSpreadsheetCell(
	cell: readonly BuilderInlineNode[]
): BuilderInlineNode[] {
	const normalized = normalizeBuilderInline(cell);
	let remainingLength = BUILDER_SPREADSHEET_CELL_MAX_LENGTH;
	const clamped: BuilderInlineNode[] = [];

	for (const node of normalized) {
		if (remainingLength <= 0) {
			break;
		}

		if (node.type === 'variable') {
			const tokenLength = formatBuilderVariableToken(node.variableId).length;

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

	return normalizeBuilderInline(clamped);
}

function clampSingleLineText(value: string, maxLength: number) {
	const normalized = value.trim().replace(/\s+/g, ' ');

	return normalized.length > maxLength ? normalized.slice(0, maxLength).trim() : normalized;
}
