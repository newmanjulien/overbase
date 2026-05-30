import { cloneBlueprintBody, type BlueprintBodyBlock } from './body';
import {
	cloneBlueprintAttachment,
	normalizeBlueprintSpreadsheetAttachment,
	type BlueprintSpreadsheetAttachment
} from './spreadsheet';

export type BlueprintEmailContent = {
	title: string;
	to: readonly string[];
	cc: readonly string[];
	attachment: BlueprintSpreadsheetAttachment | null;
	body: readonly BlueprintBodyBlock[];
};

export function cloneBlueprintEmailContent(content: BlueprintEmailContent): BlueprintEmailContent {
	return {
		title: content.title,
		to: [...content.to],
		cc: [...content.cc],
		attachment: cloneBlueprintAttachment(content.attachment),
		body: cloneBlueprintBody(content.body)
	};
}

export function normalizeBlueprintEmailContent(content: BlueprintEmailContent): BlueprintEmailContent {
	return {
		title: content.title,
		to: [...content.to],
		cc: [...content.cc],
		attachment: normalizeBlueprintSpreadsheetAttachment(content.attachment),
		body: cloneBlueprintBody(content.body)
	};
}

export function updateBlueprintEmailContentField<Key extends keyof BlueprintEmailContent>(
	content: BlueprintEmailContent,
	field: Key,
	value: BlueprintEmailContent[Key]
): BlueprintEmailContent {
	return normalizeBlueprintEmailContent({
		...content,
		[field]: value
	});
}
