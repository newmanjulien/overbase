import {
	EMAIL_DRAFT_LIMITS,
	type BuilderTurnResult,
	type EmailBodyBlock,
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

function normalizeRecipients(recipients: string[]) {
	const normalizedRecipients = recipients
		.slice(0, EMAIL_DRAFT_LIMITS.recipients)
		.map((recipient) => clampText(recipient, EMAIL_DRAFT_LIMITS.recipient))
		.filter(Boolean);

	return Array.from(new Set(normalizedRecipients));
}

export function normalizeEmailBodyBlock(block: EmailBodyBlock): EmailBodyBlock | null {
	switch (block.type) {
		case 'paragraph': {
			const text = clampMultilineText(block.text, EMAIL_DRAFT_LIMITS.bodyText);

			return text ? { type: 'paragraph', text } : null;
		}
		case 'bullets': {
			const items = block.items
				.slice(0, EMAIL_DRAFT_LIMITS.bulletItems)
				.map((item) => clampMultilineText(item, EMAIL_DRAFT_LIMITS.bodyText))
				.filter(Boolean);

			return items.length > 0 ? { type: 'bullets', items } : null;
		}
		case 'link': {
			const label = clampText(block.label, EMAIL_DRAFT_LIMITS.linkLabel);
			const href = clampText(block.href, EMAIL_DRAFT_LIMITS.linkHref);

			return label && href ? { type: 'link', label, href } : null;
		}
	}
}

function normalizeEmailBody(body: EmailBodyBlock[]) {
	return body
		.slice(0, EMAIL_DRAFT_LIMITS.bodyBlocks)
		.map(normalizeEmailBodyBlock)
		.filter((block): block is EmailBodyBlock => block !== null);
}

export function normalizeEmailDraft(draft: EmailDraft): EmailDraft {
	return {
		to: normalizeRecipients(draft.to),
		cc: normalizeRecipients(draft.cc),
		subject: clampText(draft.subject, EMAIL_DRAFT_LIMITS.subject),
		body: normalizeEmailBody(draft.body)
	};
}

export function applyEmailDraftPatch(draft: EmailDraft, patch: EmailDraftPatch): EmailDraft {
	const nextDraft: EmailDraft = {
		to: [...draft.to],
		cc: [...draft.cc],
		subject: draft.subject,
		body: [...draft.body]
	};

	for (const operation of patch.operations) {
		switch (operation.type) {
			case 'setTo':
				nextDraft.to = operation.to;
				break;
			case 'setCc':
				nextDraft.cc = operation.cc;
				break;
			case 'setSubject':
				nextDraft.subject = operation.subject;
				break;
			case 'setBody':
				nextDraft.body = operation.body;
				break;
		}
	}

	return normalizeEmailDraft(nextDraft);
}

function normalizeQuestionForComparison(value: string) {
	return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function shouldAppendNextQuestion(assistantMessage: string, nextQuestion: string) {
	const normalizedAssistantMessage = normalizeQuestionForComparison(assistantMessage);
	const normalizedNextQuestion = normalizeQuestionForComparison(nextQuestion);

	return normalizedNextQuestion.length > 0 && !normalizedAssistantMessage.includes(normalizedNextQuestion);
}

export function buildBuilderAssistantText(turn: BuilderTurnResult) {
	const assistantMessage = turn.assistantMessage.trim();
	const nextQuestion = turn.nextQuestion?.trim() ?? '';
	const text =
		nextQuestion && shouldAppendNextQuestion(assistantMessage, nextQuestion)
			? `${assistantMessage}\n\n${nextQuestion}`
			: assistantMessage;

	return clampMultilineText(text, MAX_MESSAGE_LENGTH);
}
