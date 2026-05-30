import {
	BUILDER_SPREADSHEET_COLUMN_COUNT,
	BUILDER_SPREADSHEET_ROW_COUNT,
	builderText,
	builderVariable,
	normalizeBuilderSpreadsheetAttachment,
	type BuilderInlineNode,
	type BuilderSpreadsheetAttachment,
	type BuilderSpreadsheetCell
} from '../model';

export function spreadsheetCell(
	...nodes: readonly (string | BuilderInlineNode)[]
): BuilderSpreadsheetCell {
	return nodes.map((node) => (typeof node === 'string' ? builderText(node) : node));
}

export function spreadsheetVariable(fieldId: string) {
	return builderVariable(fieldId);
}

export function seededSpreadsheetAttachment(
	filename: string,
	rows: readonly (readonly BuilderSpreadsheetCell[])[]
): BuilderSpreadsheetAttachment {
	const attachment = normalizeBuilderSpreadsheetAttachment({
		filename,
		cells: Array.from({ length: BUILDER_SPREADSHEET_ROW_COUNT }, (_, rowIndex) =>
			Array.from(
				{ length: BUILDER_SPREADSHEET_COLUMN_COUNT },
				(_, columnIndex) => rows[rowIndex]?.[columnIndex] ?? []
			)
		)
	});

	if (!attachment) {
		throw new Error(`Invalid builder spreadsheet attachment filename "${filename}".`);
	}

	return attachment;
}
