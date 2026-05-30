import {
	cloneBuilderInline,
	formatBuilderVariableToken,
	normalizeBuilderInline,
	type BuilderInlineNode
} from './inline';

const BUILDER_ATTACHMENT_FILENAME_MAX_LENGTH = 160;
const BUILDER_SPREADSHEET_ATTACHMENT_EXTENSION = 'xlsx';

export const BUILDER_SPREADSHEET_ROW_COUNT = 100;
export const BUILDER_SPREADSHEET_COLUMN_COUNT = 26;
export const BUILDER_SPREADSHEET_CELL_MAX_LENGTH = 200;
export const BUILDER_SPREADSHEET_COLUMN_LABELS = Array.from(
	{ length: BUILDER_SPREADSHEET_COLUMN_COUNT },
	(_, index) => String.fromCharCode('A'.charCodeAt(0) + index)
) as string[];

export type BuilderSpreadsheetCell = readonly BuilderInlineNode[];

export type BuilderSpreadsheetAttachment = {
	filename: string;
	cells: readonly BuilderSpreadsheetCell[][];
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
		cells: Array.from({ length: BUILDER_SPREADSHEET_ROW_COUNT }, () =>
			Array.from({ length: BUILDER_SPREADSHEET_COLUMN_COUNT }, () => [])
		)
	})!;
}

export function cloneBuilderAttachment(attachment: BuilderSpreadsheetAttachment | null) {
	return attachment
		? {
				filename: attachment.filename,
				cells: attachment.cells.map((row) => row.map((cell) => cloneBuilderInline(cell)))
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

	return {
		filename,
		cells: Array.from({ length: BUILDER_SPREADSHEET_ROW_COUNT }, (_, rowIndex) =>
			Array.from({ length: BUILDER_SPREADSHEET_COLUMN_COUNT }, (_, columnIndex) =>
				normalizeBuilderSpreadsheetCell(attachment.cells[rowIndex]?.[columnIndex] ?? [])
			)
		)
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
			const tokenLength = formatBuilderVariableToken(node.fieldId).length;

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
