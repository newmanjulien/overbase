import { cloneBuilderBody, type BuilderBodyBlock } from './body';
import {
	cloneBuilderAttachment,
	normalizeBuilderSpreadsheetAttachment,
	type BuilderSpreadsheetAttachment
} from './spreadsheet';

export type BuilderEmailContent = {
	title: string;
	to: readonly string[];
	cc: readonly string[];
	attachment: BuilderSpreadsheetAttachment | null;
	body: readonly BuilderBodyBlock[];
};

export function cloneBuilderEmailContent(content: BuilderEmailContent): BuilderEmailContent {
	return {
		title: content.title,
		to: [...content.to],
		cc: [...content.cc],
		attachment: cloneBuilderAttachment(content.attachment),
		body: cloneBuilderBody(content.body)
	};
}

export function normalizeBuilderEmailContent(content: BuilderEmailContent): BuilderEmailContent {
	return {
		title: content.title,
		to: [...content.to],
		cc: [...content.cc],
		attachment: normalizeBuilderSpreadsheetAttachment(content.attachment),
		body: cloneBuilderBody(content.body)
	};
}

export function updateBuilderEmailContentField<Key extends keyof BuilderEmailContent>(
	content: BuilderEmailContent,
	field: Key,
	value: BuilderEmailContent[Key]
): BuilderEmailContent {
	return normalizeBuilderEmailContent({
		...content,
		[field]: value
	});
}
