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
import { getEmailFormatDefinition } from '$shared/email-format-definitions';
import type {
	FormatStarter,
	InternalDataFormatStarter,
	PublicDataFormatStarter
} from '../types';

type FormatStarterArtworkInput = Omit<FormatStarterArtwork, 'card'> & {
	card: Omit<FormatStarterArtwork['card'], 'symbolSize'> & {
		symbolSize?: FormatStarterArtworkCardSymbolSize;
	};
};

type InternalDataFormatStarterInput = Omit<InternalDataFormatStarter, 'artwork' | 'mode' | 'variables'> & {
	artwork: FormatStarterArtworkInput;
};

type PublicDataFormatStarterInput = Omit<
	PublicDataFormatStarter,
	| 'artwork'
	| 'mode'
	| 'variables'
	| 'initialRules'
	| 'ruleDataSourceAction'
	| 'ruleDataSourceModal'
	| 'ruleInfoCard'
> & {
	artwork: FormatStarterArtworkInput;
};

type FormatStarterInput = InternalDataFormatStarterInput | PublicDataFormatStarterInput;

const DEFAULT_FORMAT_STARTER_ARTWORK_CARD_SYMBOL_SIZE: FormatStarterArtworkCardSymbolSize = 'md';

export function defineFormatStarter(entry: FormatStarterInput): FormatStarter {
	const definition = getEmailFormatDefinition(entry.formatDefinitionSlug);

	if (!definition) {
		throw new Error(
			`Format starter "${entry.slug}" references missing format definition "${entry.formatDefinitionSlug}".`
		);
	}

	const normalizedEntry = {
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

	if (definition.dataMode === 'public-data') {
		return {
			...normalizedEntry,
			mode: definition.dataMode,
			variables: definition.variables,
			initialRules: definition.initialRules,
			ruleDataSourceAction: definition.ruleDataSourceAction,
			ruleDataSourceModal: definition.ruleDataSourceModal,
			ruleInfoCard: definition.ruleInfoCard
		};
	}

	return {
		...normalizedEntry,
		mode: definition.dataMode,
		variables: definition.variables
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
