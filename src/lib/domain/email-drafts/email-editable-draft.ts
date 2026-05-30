import {
	createDefaultEmailSpreadsheetAttachment,
	normalizeEmailAttachmentName,
	normalizeEmailSpreadsheetAttachment,
	type EmailBodyBlock,
	type EmailDraft,
	type EmailSpreadsheetAttachment
} from '$shared/email-drafts';

export type EditableEmailDraft = {
	toText: string;
	ccText: string;
	attachmentInputText: string;
	attachment: EmailSpreadsheetAttachment | null;
	bodyText: string;
};

export function formatRecipients(recipients: string[]) {
	return recipients.join('; ');
}

export function toEditableEmailDraft(draft: EmailDraft): EditableEmailDraft {
	return {
		toText: formatRecipients(draft.to),
		ccText: formatRecipients(draft.cc),
		attachmentInputText: '',
		attachment: draft.attachment
			? {
					filename: draft.attachment.filename,
					cells: draft.attachment.cells.map((row) => [...row])
				}
			: null,
		bodyText: serializeEmailBodyText(draft.body)
	};
}

export function fromEditableEmailDraft(editableDraft: EditableEmailDraft): EmailDraft {
	return {
		to: parseRecipients(editableDraft.toText),
		cc: parseRecipients(editableDraft.ccText),
		attachment: editableDraft.attachment,
		body: parseEmailBodyText(editableDraft.bodyText)
	};
}

export function addEditableSpreadsheetAttachment(
	editableDraft: EditableEmailDraft,
	attachmentName: string
): EditableEmailDraft {
	const normalizedAttachmentName = normalizeEmailAttachmentName(attachmentName);

	if (!normalizedAttachmentName) {
		return editableDraft;
	}

	return {
		...editableDraft,
		attachmentInputText: '',
		attachment: normalizeEmailSpreadsheetAttachment(
			createDefaultEmailSpreadsheetAttachment(normalizedAttachmentName)
		)
	};
}

export function removeEditableSpreadsheetAttachment(editableDraft: EditableEmailDraft): EditableEmailDraft {
	return {
		...editableDraft,
		attachment: null
	};
}

function parseRecipients(value: string) {
	return value
		.split(/[;,\n]/)
		.map((recipient) => recipient.trim())
		.filter(Boolean);
}

function serializeEmailBodyText(body: EmailBodyBlock[]) {
	return body
		.map((block) => {
			if (block.type === 'paragraph') {
				return block.text;
			}

			if (block.type === 'bullets') {
				return block.items.map((item) => `- ${item}`).join('\n');
			}

			return `${block.label}: ${block.href}`;
		})
		.join('\n\n');
}

function parseLinkLine(line: string): EmailBodyBlock | null {
	const labeledLinkMatch = /^(.+?):\s*((?:https?:\/\/|mailto:)\S+)$/i.exec(line);

	if (labeledLinkMatch) {
		return {
			type: 'link',
			label: labeledLinkMatch[1].trim(),
			href: labeledLinkMatch[2].trim()
		};
	}

	if (/^(https?:\/\/|mailto:)\S+$/i.test(line)) {
		return {
			type: 'link',
			label: line,
			href: line
		};
	}

	return null;
}

function parseEmailBodyText(value: string): EmailBodyBlock[] {
	const blocks: EmailBodyBlock[] = [];
	const lines = value.replace(/\r\n/g, '\n').split('\n');
	let paragraphLines: string[] = [];
	let bulletItems: string[] = [];

	function flushParagraph() {
		const text = paragraphLines.join('\n').trim();

		if (text) {
			blocks.push({ type: 'paragraph', text });
		}

		paragraphLines = [];
	}

	function flushBullets() {
		if (bulletItems.length > 0) {
			blocks.push({ type: 'bullets', items: bulletItems });
		}

		bulletItems = [];
	}

	for (const rawLine of lines) {
		const line = rawLine.trim();

		if (!line) {
			flushParagraph();
			flushBullets();
			continue;
		}

		const bulletMatch = /^[-*]\s+(.+)$/.exec(line);

		if (bulletMatch) {
			flushParagraph();
			bulletItems.push(bulletMatch[1].trim());
			continue;
		}

		flushBullets();

		const linkBlock = parseLinkLine(line);

		if (linkBlock) {
			flushParagraph();
			blocks.push(linkBlock);
			continue;
		}

		paragraphLines.push(rawLine);
	}

	flushParagraph();
	flushBullets();

	return blocks;
}
