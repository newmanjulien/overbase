export const SPREADSHEET_ROW_COUNT = 100;
export const SPREADSHEET_COLUMN_COUNT = 26;
export const SPREADSHEET_CELL_MAX_LENGTH = 200;

export const SPREADSHEET_COLUMN_LABELS = Array.from(
	{ length: SPREADSHEET_COLUMN_COUNT },
	(_, index) => String.fromCharCode('A'.charCodeAt(0) + index)
) as string[];

export const SPREADSHEET_ROW_INDEXES = Array.from(
	{ length: SPREADSHEET_ROW_COUNT },
	(_, index) => index
) as number[];

export type SpreadsheetCellKey = `${number}:${number}`;
export type SpreadsheetCellAddress = {
	rowIndex: number;
	columnIndex: number;
};
export type SpreadsheetFormatting = {
	greyRowIndexes: number[];
	greyColumnIndexes: number[];
	boldCellsByKey: Record<SpreadsheetCellKey, true>;
};
export type SpreadsheetFormattingInput = Partial<{
	greyRowIndexes: readonly number[];
	greyColumnIndexes: readonly number[];
	boldCellsByKey: Partial<Record<string, boolean>>;
}> | null | undefined;
export type SpreadsheetCellFormatting = {
	isGrey: boolean;
	isBold: boolean;
};

export function cellKey(rowIndex: number, columnIndex: number): SpreadsheetCellKey {
	return `${rowIndex}:${columnIndex}`;
}

export function parseCellKey(key: string): SpreadsheetCellAddress | null {
	const match = /^(\d+):(\d+)$/.exec(key);

	if (!match) {
		return null;
	}

	const rowIndex = Number.parseInt(match[1], 10);
	const columnIndex = Number.parseInt(match[2], 10);

	return isSpreadsheetCellInBounds(rowIndex, columnIndex) ? { rowIndex, columnIndex } : null;
}

export function isSpreadsheetCellInBounds(rowIndex: number, columnIndex: number) {
	return (
		Number.isInteger(rowIndex) &&
		Number.isInteger(columnIndex) &&
		rowIndex >= 0 &&
		rowIndex < SPREADSHEET_ROW_COUNT &&
		columnIndex >= 0 &&
		columnIndex < SPREADSHEET_COLUMN_COUNT
	);
}

export function getSpreadsheetCell<T>(
	cellsByKey: Partial<Record<SpreadsheetCellKey, T>>,
	rowIndex: number,
	columnIndex: number
): T | undefined {
	return cellsByKey[cellKey(rowIndex, columnIndex)];
}

export function updateSparseSpreadsheetCell<T>(
	cellsByKey: Partial<Record<SpreadsheetCellKey, T>>,
	rowIndex: number,
	columnIndex: number,
	value: T,
	isEmpty: (value: T) => boolean
): Record<SpreadsheetCellKey, T> {
	const nextCellsByKey = { ...cellsByKey } as Record<SpreadsheetCellKey, T>;
	const key = cellKey(rowIndex, columnIndex);

	if (!isSpreadsheetCellInBounds(rowIndex, columnIndex) || isEmpty(value)) {
		delete nextCellsByKey[key];
		return nextCellsByKey;
	}

	nextCellsByKey[key] = value;

	return nextCellsByKey;
}

export function normalizeSpreadsheetFormatting(
	formatting: SpreadsheetFormattingInput
): SpreadsheetFormatting {
	const greyRowIndexes = Array.from(
		new Set((formatting?.greyRowIndexes ?? []).filter(isSpreadsheetRowInBounds))
	).sort((first, second) => first - second);
	const greyColumnIndexes = Array.from(
		new Set((formatting?.greyColumnIndexes ?? []).filter(isSpreadsheetColumnInBounds))
	).sort((first, second) => first - second);
	const boldCellsByKey = Object.fromEntries(
		Object.entries(formatting?.boldCellsByKey ?? {})
			.map(([key, value]) => {
				const address = value === true ? parseCellKey(key) : null;

				return address ? [cellKey(address.rowIndex, address.columnIndex), true] : null;
			})
			.filter((entry): entry is [SpreadsheetCellKey, true] => entry !== null)
	) as Record<SpreadsheetCellKey, true>;

	return {
		greyRowIndexes,
		greyColumnIndexes,
		boldCellsByKey
	};
}

export function getSpreadsheetCellFormatting(
	formatting: SpreadsheetFormatting,
	rowIndex: number,
	columnIndex: number
): SpreadsheetCellFormatting {
	const hasCustomGreyFormatting =
		formatting.greyRowIndexes.length > 0 || formatting.greyColumnIndexes.length > 0;
	const hasCustomBoldFormatting = Object.keys(formatting.boldCellsByKey).length > 0;

	return {
		isGrey: hasCustomGreyFormatting
			? formatting.greyRowIndexes.includes(rowIndex) ||
				formatting.greyColumnIndexes.includes(columnIndex)
			: rowIndex === 0,
		isBold: hasCustomBoldFormatting
			? formatting.boldCellsByKey[cellKey(rowIndex, columnIndex)] === true
			: rowIndex === 0
	};
}

function isSpreadsheetRowInBounds(rowIndex: number) {
	return Number.isInteger(rowIndex) && rowIndex >= 0 && rowIndex < SPREADSHEET_ROW_COUNT;
}

function isSpreadsheetColumnInBounds(columnIndex: number) {
	return (
		Number.isInteger(columnIndex) &&
		columnIndex >= 0 &&
		columnIndex < SPREADSHEET_COLUMN_COUNT
	);
}
