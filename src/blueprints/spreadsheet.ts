import {
	blueprintText,
	cloneBlueprintInline,
	formatBlueprintVariableToken,
	normalizeBlueprintInline,
	stringifyBlueprintInline,
	type BlueprintInlineNode
} from './inline';

const BLUEPRINT_ATTACHMENT_FILENAME_MAX_LENGTH = 160;
const BLUEPRINT_SPREADSHEET_ATTACHMENT_EXTENSION = 'xlsx';

export const BLUEPRINT_SPREADSHEET_ROW_COUNT = 100;
export const BLUEPRINT_SPREADSHEET_COLUMN_COUNT = 26;
export const BLUEPRINT_SPREADSHEET_CELL_MAX_LENGTH = 200;
export const BLUEPRINT_SPREADSHEET_COLUMN_LABELS = Array.from(
	{ length: BLUEPRINT_SPREADSHEET_COLUMN_COUNT },
	(_, index) => String.fromCharCode('A'.charCodeAt(0) + index)
) as string[];

export type BlueprintSpreadsheetCell = readonly BlueprintInlineNode[];

export type BlueprintSpreadsheetAttachment = {
	filename: string;
	cells: readonly BlueprintSpreadsheetCell[][];
};

export function normalizeBlueprintAttachmentName(value: string) {
	const withoutQueryOrHash = value.trim().split(/[?#]/)[0] ?? '';
	const filename = withoutQueryOrHash.split(/[\\/]/).pop() ?? '';
	const baseName = filename.replace(/\.[^.]+$/i, '');
	const sanitizedBaseName = baseName
		.replace(/[^a-zA-Z0-9 ._()-]+/g, '_')
		.replace(/\s+/g, ' ')
		.replace(/\.+$/g, '')
		.trim();
	const normalized = clampSingleLineText(sanitizedBaseName, BLUEPRINT_ATTACHMENT_FILENAME_MAX_LENGTH);

	return normalized ? `${normalized}.${BLUEPRINT_SPREADSHEET_ATTACHMENT_EXTENSION}` : '';
}

export function createDefaultBlueprintSpreadsheetAttachment(
	filename?: string
): BlueprintSpreadsheetAttachment {
	return normalizeBlueprintSpreadsheetAttachment({
		filename: filename ?? `Spreadsheet.${BLUEPRINT_SPREADSHEET_ATTACHMENT_EXTENSION}`,
		cells: Array.from({ length: BLUEPRINT_SPREADSHEET_ROW_COUNT }, () =>
			Array.from({ length: BLUEPRINT_SPREADSHEET_COLUMN_COUNT }, () => [])
		)
	})!;
}

export function cloneBlueprintAttachment(attachment: BlueprintSpreadsheetAttachment | null) {
	return attachment
		? {
				filename: attachment.filename,
				cells: attachment.cells.map((row) => row.map((cell) => cloneBlueprintInline(cell)))
			}
		: null;
}

export function fromPlainSpreadsheetAttachment(attachment: {
	filename: string;
	cells: readonly string[][];
}): BlueprintSpreadsheetAttachment {
	return {
		filename: attachment.filename,
		cells: attachment.cells.map((row) => row.map((cell) => (cell ? [blueprintText(cell)] : [])))
	};
}

export function stringifyBlueprintSpreadsheetCell(cell: BlueprintSpreadsheetCell) {
	return stringifyBlueprintInline(cell);
}

export function toPlainSpreadsheetAttachment(
	attachment: BlueprintSpreadsheetAttachment | null
): { filename: string; cells: string[][] } | null {
	if (!attachment) {
		return null;
	}

	const normalizedAttachment = normalizeBlueprintSpreadsheetAttachment(attachment);

	if (!normalizedAttachment) {
		return null;
	}

	return normalizePlainSpreadsheetAttachment({
		filename: normalizedAttachment.filename,
		cells: normalizedAttachment.cells.map((row) => row.map(stringifyBlueprintSpreadsheetCell))
	});
}

export function normalizeBlueprintSpreadsheetAttachment(
	attachment: BlueprintSpreadsheetAttachment | null
): BlueprintSpreadsheetAttachment | null {
	if (!attachment) {
		return null;
	}

	const filename = normalizeBlueprintAttachmentName(attachment.filename);

	if (!filename) {
		return null;
	}

	return {
		filename,
		cells: Array.from({ length: BLUEPRINT_SPREADSHEET_ROW_COUNT }, (_, rowIndex) =>
			Array.from({ length: BLUEPRINT_SPREADSHEET_COLUMN_COUNT }, (_, columnIndex) =>
				normalizeBlueprintSpreadsheetCell(attachment.cells[rowIndex]?.[columnIndex] ?? [])
			)
		)
	};
}

export function normalizeBlueprintSpreadsheetCell(
	cell: readonly BlueprintInlineNode[]
): BlueprintInlineNode[] {
	const normalized = normalizeBlueprintInline(cell);
	let remainingLength = BLUEPRINT_SPREADSHEET_CELL_MAX_LENGTH;
	const clamped: BlueprintInlineNode[] = [];

	for (const node of normalized) {
		if (remainingLength <= 0) {
			break;
		}

		if (node.type === 'variable') {
			const tokenLength = formatBlueprintVariableToken(node.fieldId).length;

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

	return normalizeBlueprintInline(clamped);
}

function normalizePlainSpreadsheetAttachment(attachment: {
	filename: string;
	cells: readonly string[][];
}) {
	const filename = normalizeBlueprintAttachmentName(attachment.filename);

	if (!filename) {
		return null;
	}

	return {
		filename,
		cells: Array.from({ length: BLUEPRINT_SPREADSHEET_ROW_COUNT }, (_, rowIndex) =>
			Array.from({ length: BLUEPRINT_SPREADSHEET_COLUMN_COUNT }, (_, columnIndex) =>
				clampSingleLineText(
					attachment.cells[rowIndex]?.[columnIndex] ?? '',
					BLUEPRINT_SPREADSHEET_CELL_MAX_LENGTH
				)
			)
		)
	};
}

function clampSingleLineText(value: string, maxLength: number) {
	const normalized = value.trim().replace(/\s+/g, ' ');

	return normalized.length > maxLength ? normalized.slice(0, maxLength).trim() : normalized;
}
