import { SPREADSHEET_CELL_MAX_LENGTH, cellKey, parseCellKey } from '../shared/spreadsheets';
import { requireViewerWorkspace } from '../backend/auth/viewer';
import {
	insertLinkedinContactsForEmailFormat,
	normalizeLinkedinContactsSource
} from '../backend/email-formats/linkedin-contacts';
import { emailFormatPublishInput } from '../backend/validators/email-formats';
import { mutation } from './_generated/server';

const MAX_TITLE_LENGTH = 120;
const MAX_RECIPIENT_LENGTH = 140;
const MAX_RECIPIENTS = 12;
const MAX_BODY_BLOCKS = 12;
const MAX_INLINE_NODES = 80;
const MAX_BODY_TEXT_LENGTH = 1_000;
const MAX_VARIABLE_ID_LENGTH = 80;
const MAX_RULES = 20;
const MAX_RULE_ID_LENGTH = 80;
const MAX_RULE_TEXT_LENGTH = 1_500;
const MAX_SELECTED_ANSWERS = 20;
const MAX_SELECTED_ANSWER_ID_LENGTH = 80;

type InlineNode =
	| {
			type: 'text';
			text: string;
	  }
	| {
			type: 'variable';
			variableId: string;
	  };

function clampText(value: string, maxLength: number) {
	const normalized = value.trim();

	return normalized.length > maxLength ? normalized.slice(0, maxLength).trim() : normalized;
}

function normalizeRecipients(recipients: string[]) {
	return [
		...new Set(
			recipients
				.slice(0, MAX_RECIPIENTS)
				.map((recipient) => clampText(recipient, MAX_RECIPIENT_LENGTH).replace(/\s+/g, ' '))
				.filter(Boolean)
		)
	];
}

function normalizeInlineNodes(nodes: InlineNode[], maxTextLength: number) {
	const normalized: InlineNode[] = [];
	let remainingTextLength = maxTextLength;

	for (const node of nodes) {
		if (normalized.length >= MAX_INLINE_NODES || remainingTextLength <= 0) {
			break;
		}

		const previous = normalized.at(-1);

		if (node.type === 'variable') {
			const variableId = clampText(node.variableId, MAX_VARIABLE_ID_LENGTH);
			const tokenLength = `{${variableId}}`.length;

			if (variableId && tokenLength <= remainingTextLength) {
				normalized.push({ type: 'variable', variableId });
				remainingTextLength -= tokenLength;
			}
			continue;
		}

		const text = node.text.slice(0, remainingTextLength);

		if (!text) {
			continue;
		}

		if (previous?.type === 'text') {
			previous.text += text;
		} else {
			normalized.push({ type: 'text', text });
		}

		remainingTextLength -= text.length;
	}

	return normalized;
}

function normalizeBody(
	body: Array<{
		id: string;
		type: 'paragraph';
		content: InlineNode[];
	}>
) {
	return body
		.slice(0, MAX_BODY_BLOCKS)
		.map((block) => ({
			id: block.id.trim(),
			type: 'paragraph' as const,
			content: normalizeInlineNodes(block.content, MAX_BODY_TEXT_LENGTH)
		}))
		.filter((block) => block.id && block.content.length > 0);
}

function normalizeAttachment(
	attachment: {
		filename: string;
		cellsByKey: Record<string, InlineNode[]>;
	} | null
) {
	if (!attachment) {
		return null;
	}

	const filename = clampText(attachment.filename, 160);

	if (!filename) {
		return null;
	}

	const cellsByKey: Record<string, InlineNode[]> = {};

	for (const [key, cell] of Object.entries(attachment.cellsByKey)) {
		const address = parseCellKey(key);
		const normalizedCell = normalizeInlineNodes(cell, SPREADSHEET_CELL_MAX_LENGTH);

		if (address && normalizedCell.length > 0) {
			cellsByKey[cellKey(address.rowIndex, address.columnIndex)] = normalizedCell;
		}
	}

	return {
		filename,
		cellsByKey
	};
}

function normalizeRules(rules: Array<{ id: string; text: string }>) {
	return rules
		.slice(0, MAX_RULES)
		.map((rule) => ({
			id: clampText(rule.id, MAX_RULE_ID_LENGTH),
			text: clampText(rule.text, MAX_RULE_TEXT_LENGTH)
		}))
		.filter((rule) => rule.id && rule.text);
}

function normalizeSelectedAnswers(selectedAnswers: Record<string, string>) {
	return Object.fromEntries(
		Object.entries(selectedAnswers)
			.slice(0, MAX_SELECTED_ANSWERS)
			.map(([questionId, answerId]) => [questionId.trim(), answerId.trim()] as const)
			.map(([questionId, answerId]) => [
				clampText(questionId, MAX_SELECTED_ANSWER_ID_LENGTH),
				clampText(answerId, MAX_SELECTED_ANSWER_ID_LENGTH)
			])
			.filter(([questionId, answerId]) => questionId && answerId)
	);
}

export const publishEmailFormat = mutation({
	args: emailFormatPublishInput,
	handler: async (ctx, args) => {
		const { user, workspace } = await requireViewerWorkspace(ctx);
		const builderSlug = args.builderSlug.trim();
		const title = clampText(args.title, MAX_TITLE_LENGTH);
		const body = normalizeBody(args.body);
		const now = Date.now();
		const linkedinContactsSource = normalizeLinkedinContactsSource(
			args.linkedinContactsSource,
			now
		);

		if (!builderSlug) {
			throw new Error('Builder slug is required.');
		}

		if (!title) {
			throw new Error('Email format title is required.');
		}

		if (body.length === 0) {
			throw new Error('Email format body is required.');
		}

		const emailFormatId = await ctx.db.insert('emailFormats', {
			workspaceId: workspace._id,
			creatorUserId: user._id,
			builderSlug,
			builderMode: args.builderMode,
			startingPointId: args.startingPointId?.trim() || null,
			selectedAnswers: normalizeSelectedAnswers(args.selectedAnswers),
			status: 'paused',
			title,
			to: normalizeRecipients(args.to),
			cc: normalizeRecipients(args.cc),
			attachment: normalizeAttachment(args.attachment),
			body,
			rules: normalizeRules(args.rules),
			linkedinContactsSummary: linkedinContactsSource?.summary ?? null,
			createdAt: now,
			updatedAt: now
		});

		await insertLinkedinContactsForEmailFormat(ctx, {
			workspaceId: workspace._id,
			emailFormatId,
			contactsSource: linkedinContactsSource,
			createdAt: now
		});

		return { emailFormatId };
	}
});
