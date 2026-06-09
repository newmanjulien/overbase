import {
	formatText,
	normalizeFormatSpreadsheetAttachment,
	type FormatInlineNode,
	type FormatSpreadsheetAttachment,
	type FormatSpreadsheetCell
} from '$lib/features/format-starters/domain';
import { cellKey } from '$domain/spreadsheets';

type SeededSpreadsheetAttachmentOptions = {
	greyRowIndexes?: readonly number[];
	greyColumnIndexes?: readonly number[];
	boldCells?: readonly {
		rowIndex: number;
		columnIndex: number;
	}[];
};

export function spreadsheetCell(
	...nodes: readonly (string | FormatInlineNode)[]
): FormatSpreadsheetCell {
	return nodes.map((node) => (typeof node === 'string' ? formatText(node) : node));
}

export function seededSpreadsheetAttachment(
	filename: string,
	rows: readonly (readonly FormatSpreadsheetCell[])[],
	options: SeededSpreadsheetAttachmentOptions = {}
): FormatSpreadsheetAttachment {
	const attachment = normalizeFormatSpreadsheetAttachment({
		filename,
		cellsByKey: Object.fromEntries(
			rows.flatMap((row, rowIndex) =>
				row.map((cell, columnIndex) => [cellKey(rowIndex, columnIndex), cell])
			)
		),
		formatting: {
			greyRowIndexes: [...(options.greyRowIndexes ?? [])],
			greyColumnIndexes: [...(options.greyColumnIndexes ?? [])],
			boldCellsByKey: Object.fromEntries(
				(options.boldCells ?? []).map((cell) => [
					cellKey(cell.rowIndex, cell.columnIndex),
					true
				])
			)
		}
	});

	if (!attachment) {
		throw new Error(`Invalid format starter spreadsheet attachment filename "${filename}".`);
	}

	return attachment;
}
