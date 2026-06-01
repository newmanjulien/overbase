import {
	formatText,
	formatVariable,
	normalizeFormatSpreadsheetAttachment,
	type FormatStarterArtwork,
	type FormatStarterArtworkCardSymbolSize,
	type FormatInlineNode,
	type FormatSpreadsheetAttachment,
	type FormatSpreadsheetCell
} from '$lib/features/format-starters/domain';
import { cellKey } from '$shared/spreadsheets';
import type { FormatStarter } from '../types';

type FormatStarterArtworkInput = Omit<FormatStarterArtwork, 'card'> & {
	card: Omit<FormatStarterArtwork['card'], 'symbolSize'> & {
		symbolSize?: FormatStarterArtworkCardSymbolSize;
	};
};

type FormatStarterInput = FormatStarter extends infer Entry
	? Entry extends FormatStarter
		? Omit<Entry, 'artwork'> & { artwork: FormatStarterArtworkInput }
		: never
	: never;

const DEFAULT_FORMAT_STARTER_ARTWORK_CARD_SYMBOL_SIZE: FormatStarterArtworkCardSymbolSize = 'md';

export function defineFormatStarter(entry: FormatStarterInput): FormatStarter {
	return {
		...entry,
		artwork: {
			...entry.artwork,
			card: {
				...entry.artwork.card,
				symbolSize:
					entry.artwork.card.symbolSize ?? DEFAULT_FORMAT_STARTER_ARTWORK_CARD_SYMBOL_SIZE
			}
		}
	};
}

export function spreadsheetCell(
	...nodes: readonly (string | FormatInlineNode)[]
): FormatSpreadsheetCell {
	return nodes.map((node) => (typeof node === 'string' ? formatText(node) : node));
}

export function spreadsheetVariable(variableId: string) {
	return formatVariable(variableId);
}

export function seededSpreadsheetAttachment(
	filename: string,
	rows: readonly (readonly FormatSpreadsheetCell[])[]
): FormatSpreadsheetAttachment {
	const attachment = normalizeFormatSpreadsheetAttachment({
		filename,
		cellsByKey: Object.fromEntries(
			rows.flatMap((row, rowIndex) =>
				row.map((cell, columnIndex) => [cellKey(rowIndex, columnIndex), cell])
			)
		)
	});

	if (!attachment) {
		throw new Error(`Invalid format starter spreadsheet attachment filename "${filename}".`);
	}

	return attachment;
}
