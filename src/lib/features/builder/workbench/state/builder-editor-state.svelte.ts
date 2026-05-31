import {
	cloneBuilderAttachment,
	cloneBuilderBody,
	formatBuilderRecipients,
	normalizeBuilderEmailContent,
	parseBuilderRecipients,
	updateBuilderEmailContentField,
	type BuilderEmailContent
} from '$lib/features/builder/domain';

export class BuilderEditorState {
	private emailContentState: { activeEmailContent: BuilderEmailContent };
	private recipientsUi = $state({
		toInputText: '',
		ccInputText: '',
		isEditingTo: false,
		isEditingCc: false
	});
	private attachmentUi = $state({
		inputText: '',
		isOpen: false
	});

	constructor(content: BuilderEmailContent) {
		this.emailContentState = $state({
			activeEmailContent: normalizeBuilderEmailContent(content)
		});
		this.syncRecipientInputs();
	}

	get activeEmailContent() {
		return this.emailContentState.activeEmailContent;
	}

	get toInputText() {
		return this.recipientsUi.toInputText;
	}

	set toInputText(value: string) {
		this.recipientsUi.toInputText = value;
	}

	get ccInputText() {
		return this.recipientsUi.ccInputText;
	}

	set ccInputText(value: string) {
		this.recipientsUi.ccInputText = value;
	}

	get isEditingTo() {
		return this.recipientsUi.isEditingTo;
	}

	set isEditingTo(value: boolean) {
		this.recipientsUi.isEditingTo = value;
	}

	get isEditingCc() {
		return this.recipientsUi.isEditingCc;
	}

	set isEditingCc(value: boolean) {
		this.recipientsUi.isEditingCc = value;
	}

	get attachmentInputText() {
		return this.attachmentUi.inputText;
	}

	get isAttachmentOpen() {
		return this.attachmentUi.isOpen;
	}

	replaceEmailContent = (nextContent: BuilderEmailContent) => {
		this.emailContentState.activeEmailContent = normalizeBuilderEmailContent(nextContent);
		this.syncRecipientInputs();
	};

	setEmailContentField = <Key extends keyof BuilderEmailContent>(
		field: Key,
		value: BuilderEmailContent[Key]
	) => {
		this.replaceEmailContent(updateBuilderEmailContentField(this.activeEmailContent, field, value));
	};

	updateTitle = (nextTitle: string) => {
		this.setEmailContentField('title', nextTitle);
	};

	setRecipientInput = (field: 'to' | 'cc', value: string) => {
		if (field === 'to') {
			this.recipientsUi.toInputText = value;
		} else {
			this.recipientsUi.ccInputText = value;
		}

		this.setEmailContentField(field, parseBuilderRecipients(value));
	};

	commitRecipientInput = (field: 'to' | 'cc', value: string) => {
		const recipients = parseBuilderRecipients(value);

		this.setEmailContentField(field, recipients);

		if (field === 'to') {
			this.recipientsUi.isEditingTo = false;
			this.recipientsUi.toInputText = formatBuilderRecipients(recipients);
		} else {
			this.recipientsUi.isEditingCc = false;
			this.recipientsUi.ccInputText = formatBuilderRecipients(recipients);
		}
	};

	setAttachmentOpen = (isOpen: boolean) => {
		this.attachmentUi.isOpen = isOpen;
	};

	openAttachment = () => {
		this.setAttachmentOpen(true);
	};

	closeAttachment = () => {
		this.setAttachmentOpen(false);
	};

	updateAttachmentInput = (value: string) => {
		this.attachmentUi.inputText = value;
	};

	addAttachment = (attachment: NonNullable<BuilderEmailContent['attachment']>) => {
		this.attachmentUi.inputText = '';
		this.setEmailContentField('attachment', cloneBuilderAttachment(attachment));
	};

	removeAttachment = (confirmDelete: (filename: string) => boolean) => {
		if (
			!this.activeEmailContent.attachment ||
			!confirmDelete(this.activeEmailContent.attachment.filename)
		) {
			return;
		}

		this.setEmailContentField('attachment', null);
		this.attachmentUi.isOpen = false;
	};

	setOpenAttachment = (attachment: NonNullable<BuilderEmailContent['attachment']>) => {
		this.setEmailContentField('attachment', cloneBuilderAttachment(attachment));
	};

	updateBody = (body: BuilderEmailContent['body']) => {
		this.setEmailContentField('body', cloneBuilderBody(body));
	};

	private syncRecipientInputs() {
		if (!this.recipientsUi.isEditingTo) {
			this.recipientsUi.toInputText = formatBuilderRecipients(this.activeEmailContent.to);
		}

		if (!this.recipientsUi.isEditingCc) {
			this.recipientsUi.ccInputText = formatBuilderRecipients(this.activeEmailContent.cc);
		}
	}
}
