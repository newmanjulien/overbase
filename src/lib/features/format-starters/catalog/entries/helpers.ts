import {
	formatText,
	normalizeFormatSpreadsheetAttachment,
	type FormatInlineNode,
	type FormatSpreadsheetAttachment,
	type FormatSpreadsheetCell
} from '$lib/features/format-starters/domain';
import { cellKey } from '$domain/spreadsheets';
import { getEmailFormatDefinition } from '$domain/email-formats';
import type {
	FormatStarter,
	FormatStarterBase
} from '../types';

type FormatStarterInput = Omit<FormatStarterBase, 'mode'>;

export function defineFormatStarter(entry: FormatStarterInput): FormatStarter {
	const definition = getEmailFormatDefinition(entry.formatDefinitionSlug);

	if (!definition) {
		throw new Error(
			`Format starter "${entry.slug}" references missing format definition "${entry.formatDefinitionSlug}".`
		);
	}

	return {
		...entry,
		mode: definition.dataMode
	};
}

export function spreadsheetCell(
	...nodes: readonly (string | FormatInlineNode)[]
): FormatSpreadsheetCell {
	return nodes.map((node) => (typeof node === 'string' ? formatText(node) : node));
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
