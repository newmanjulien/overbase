import {
	BLUEPRINT_SPREADSHEET_COLUMN_COUNT,
	BLUEPRINT_SPREADSHEET_ROW_COUNT,
	blueprintText,
	blueprintVariable,
	normalizeBlueprintSpreadsheetAttachment,
	type BlueprintInlineNode,
	type BlueprintSpreadsheetAttachment,
	type BlueprintSpreadsheetCell
} from '../model';

export function spreadsheetCell(
	...nodes: readonly (string | BlueprintInlineNode)[]
): BlueprintSpreadsheetCell {
	return nodes.map((node) => (typeof node === 'string' ? blueprintText(node) : node));
}

export function spreadsheetVariable(fieldId: string) {
	return blueprintVariable(fieldId);
}

export function seededSpreadsheetAttachment(
	filename: string,
	rows: readonly (readonly BlueprintSpreadsheetCell[])[]
): BlueprintSpreadsheetAttachment {
	const attachment = normalizeBlueprintSpreadsheetAttachment({
		filename,
		cells: Array.from({ length: BLUEPRINT_SPREADSHEET_ROW_COUNT }, (_, rowIndex) =>
			Array.from(
				{ length: BLUEPRINT_SPREADSHEET_COLUMN_COUNT },
				(_, columnIndex) => rows[rowIndex]?.[columnIndex] ?? []
			)
		)
	});

	if (!attachment) {
		throw new Error(`Invalid blueprint spreadsheet attachment filename "${filename}".`);
	}

	return attachment;
}
