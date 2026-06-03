import {
	formatText,
	formatVariable,
	normalizeFormatSpreadsheetAttachment,
	type FormatInlineNode,
	type FormatSpreadsheetAttachment,
	type FormatSpreadsheetCell
} from '$lib/features/format-starters/domain';
import { cellKey } from '$domain/spreadsheets';
import {
	getEmailFormatDefinition,
	getEmailFormatSpec
} from '$domain/email-formats';
import type {
	FormatStarter,
	InternalDataFormatStarter,
	PublicDataFormatStarter
} from '../types';

type InternalDataFormatStarterInput = Omit<InternalDataFormatStarter, 'mode'>;
type PublicDataFormatStarterInput = Omit<
	PublicDataFormatStarter,
	'mode' | 'ruleInfoCard'
>;

type FormatStarterInput = InternalDataFormatStarterInput | PublicDataFormatStarterInput;

export function defineFormatStarter(entry: FormatStarterInput): FormatStarter {
	const definition = getEmailFormatDefinition(entry.formatDefinitionSlug);

	if (!definition) {
		throw new Error(
			`Format starter "${entry.slug}" references missing format definition "${entry.formatDefinitionSlug}".`
		);
	}

	if (definition.dataMode === 'public-data') {
		const firstStartingPoint = entry.startingPoints[0];
		const initialSpec = firstStartingPoint
			? getEmailFormatSpec(definition.slug, firstStartingPoint.variantSlug)
			: null;

		if (!initialSpec?.ruleInfoCard) {
			throw new Error(
				`Format starter "${entry.slug}" references definition "${definition.slug}" without rule info-card copy.`
			);
		}

		return {
			...entry,
			mode: definition.dataMode,
			ruleInfoCard: initialSpec.ruleInfoCard
		};
	}

	return {
		...entry,
		mode: definition.dataMode,
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
