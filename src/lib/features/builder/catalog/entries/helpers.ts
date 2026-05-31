import {
	builderText,
	builderVariable,
	normalizeBuilderSpreadsheetAttachment,
	type BuilderArtwork,
	type BuilderArtworkCardSymbolSize,
	type BuilderInlineNode,
	type BuilderSpreadsheetAttachment,
	type BuilderSpreadsheetCell
} from '$lib/features/builder/domain';
import { cellKey } from '$shared/spreadsheets';
import type { BuilderRegistryEntry } from '../types';

type BuilderArtworkInput = Omit<BuilderArtwork, 'card'> & {
	card: Omit<BuilderArtwork['card'], 'symbolSize'> & {
		symbolSize?: BuilderArtworkCardSymbolSize;
	};
};

type BuilderRegistryEntryInput = BuilderRegistryEntry extends infer Entry
	? Entry extends BuilderRegistryEntry
		? Omit<Entry, 'artwork'> & { artwork: BuilderArtworkInput }
		: never
	: never;

const DEFAULT_BUILDER_ARTWORK_CARD_SYMBOL_SIZE: BuilderArtworkCardSymbolSize = 'md';

export function defineBuilder(entry: BuilderRegistryEntryInput): BuilderRegistryEntry {
	return {
		...entry,
		artwork: {
			...entry.artwork,
			card: {
				...entry.artwork.card,
				symbolSize:
					entry.artwork.card.symbolSize ?? DEFAULT_BUILDER_ARTWORK_CARD_SYMBOL_SIZE
			}
		}
	};
}

export function spreadsheetCell(
	...nodes: readonly (string | BuilderInlineNode)[]
): BuilderSpreadsheetCell {
	return nodes.map((node) => (typeof node === 'string' ? builderText(node) : node));
}

export function spreadsheetVariable(variableId: string) {
	return builderVariable(variableId);
}

export function seededSpreadsheetAttachment(
	filename: string,
	rows: readonly (readonly BuilderSpreadsheetCell[])[]
): BuilderSpreadsheetAttachment {
	const attachment = normalizeBuilderSpreadsheetAttachment({
		filename,
		cellsByKey: Object.fromEntries(
			rows.flatMap((row, rowIndex) =>
				row.map((cell, columnIndex) => [cellKey(rowIndex, columnIndex), cell])
			)
		)
	});

	if (!attachment) {
		throw new Error(`Invalid builder spreadsheet attachment filename "${filename}".`);
	}

	return attachment;
}
