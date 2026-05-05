import {
	EMAIL_DRAFT_LIMITS,
	type BuilderTurnResult,
	type EmailBlock,
	type EmailDraft,
	type EmailDraftPatch
} from './builderEmailContract';
import { MAX_MESSAGE_LENGTH } from './conversationCore';

function clampText(value: string, maxLength: number) {
	const normalized = value.trim().replace(/\s+/g, ' ');

	return normalized.length > maxLength ? normalized.slice(0, maxLength).trim() : normalized;
}

function clampMultilineText(value: string, maxLength: number) {
	const normalized = value.trim();

	return normalized.length > maxLength ? normalized.slice(0, maxLength).trim() : normalized;
}

function normalizeBlockId(value: string, fallback: string) {
	const normalized = value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9-]+/g, '-')
		.replace(/^-+|-+$/g, '');

	return normalized || fallback;
}

function normalizeColor(value: string, fallback: string) {
	const normalized = clampText(value, EMAIL_DRAFT_LIMITS.color);

	return /^#[0-9a-fA-F]{3,8}$/.test(normalized) ? normalized : fallback;
}

export function normalizeEmailBlock(block: EmailBlock): EmailBlock {
	switch (block.type) {
		case 'header':
			return {
				id: normalizeBlockId(block.id, 'header'),
				type: 'header',
				eyebrow: clampText(block.eyebrow, EMAIL_DRAFT_LIMITS.label),
				title: clampText(block.title, EMAIL_DRAFT_LIMITS.title),
				body: clampMultilineText(block.body, EMAIL_DRAFT_LIMITS.blockText)
			};
		case 'summary':
			return {
				id: normalizeBlockId(block.id, 'summary'),
				type: 'summary',
				title: clampText(block.title, EMAIL_DRAFT_LIMITS.title),
				body: clampMultilineText(block.body, EMAIL_DRAFT_LIMITS.blockText)
			};
		case 'details':
			return {
				id: normalizeBlockId(block.id, 'details'),
				type: 'details',
				title: clampText(block.title, EMAIL_DRAFT_LIMITS.title),
				items: block.items.slice(0, EMAIL_DRAFT_LIMITS.detailItems).map((item) => ({
					label: clampText(item.label, EMAIL_DRAFT_LIMITS.label),
					value: clampText(item.value, EMAIL_DRAFT_LIMITS.blockText)
				}))
			};
		case 'table':
			return {
				id: normalizeBlockId(block.id, 'table'),
				type: 'table',
				title: clampText(block.title, EMAIL_DRAFT_LIMITS.title),
				columns: block.columns
					.slice(0, EMAIL_DRAFT_LIMITS.tableColumns)
					.map((column) => clampText(column, EMAIL_DRAFT_LIMITS.label)),
				rows: block.rows.slice(0, EMAIL_DRAFT_LIMITS.tableRows).map((row) =>
					row
						.slice(0, EMAIL_DRAFT_LIMITS.tableColumns)
						.map((cell) => clampText(cell, EMAIL_DRAFT_LIMITS.blockText))
				)
			};
		case 'cta':
			return {
				id: normalizeBlockId(block.id, 'cta'),
				type: 'cta',
				label: clampText(block.label, EMAIL_DRAFT_LIMITS.title),
				description: clampMultilineText(block.description, EMAIL_DRAFT_LIMITS.blockText),
				buttonLabel: clampText(block.buttonLabel, EMAIL_DRAFT_LIMITS.label)
			};
		case 'footer':
			return {
				id: normalizeBlockId(block.id, 'footer'),
				type: 'footer',
				body: clampMultilineText(block.body, EMAIL_DRAFT_LIMITS.blockText)
			};
	}
}

export function normalizeEmailDraft(draft: EmailDraft): EmailDraft {
	return {
		title: clampText(draft.title, EMAIL_DRAFT_LIMITS.title),
		subject: clampText(draft.subject, EMAIL_DRAFT_LIMITS.subject),
		previewText: clampText(draft.previewText, EMAIL_DRAFT_LIMITS.previewText),
		theme: {
			accentColor: normalizeColor(draft.theme.accentColor, '#18181b'),
			backgroundColor: normalizeColor(draft.theme.backgroundColor, '#f4f4f5'),
			surfaceColor: normalizeColor(draft.theme.surfaceColor, '#ffffff'),
			textColor: normalizeColor(draft.theme.textColor, '#18181b')
		},
		blocks: draft.blocks.slice(0, EMAIL_DRAFT_LIMITS.blocks).map(normalizeEmailBlock)
	};
}

export function applyEmailDraftPatch(draft: EmailDraft, patch: EmailDraftPatch): EmailDraft {
	const nextDraft: EmailDraft = {
		...draft,
		theme: { ...draft.theme },
		blocks: [...draft.blocks]
	};

	for (const operation of patch.operations) {
		switch (operation.type) {
			case 'setTitle':
				nextDraft.title = operation.title;
				break;
			case 'setSubject':
				nextDraft.subject = operation.subject;
				break;
			case 'setPreviewText':
				nextDraft.previewText = operation.previewText;
				break;
			case 'setTheme':
				nextDraft.theme = { ...operation.theme };
				break;
			case 'upsertBlock': {
				const block = normalizeEmailBlock(operation.block);
				const blockIndex = nextDraft.blocks.findIndex((existingBlock) => existingBlock.id === block.id);

				if (blockIndex >= 0) {
					nextDraft.blocks[blockIndex] = block;
				} else if (nextDraft.blocks.length < EMAIL_DRAFT_LIMITS.blocks) {
					nextDraft.blocks = [...nextDraft.blocks, block];
				}
				break;
			}
			case 'removeBlock':
				nextDraft.blocks = nextDraft.blocks.filter(
					(block) => block.id !== normalizeBlockId(operation.blockId, '')
				);
				break;
		}
	}

	return normalizeEmailDraft(nextDraft);
}

export function buildBuilderAssistantText(turn: BuilderTurnResult) {
	return clampMultilineText(
		turn.nextQuestion
			? `${turn.assistantMessage.trim()}\n\n${turn.nextQuestion.trim()}`
			: turn.assistantMessage,
		MAX_MESSAGE_LENGTH
	);
}
