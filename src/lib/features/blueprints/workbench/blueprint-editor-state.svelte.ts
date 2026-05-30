import {
	cloneBlueprintAttachment,
	cloneBlueprintBody,
	formatBlueprintRecipients,
	normalizeBlueprintEmailContent,
	parseBlueprintRecipients,
	updateBlueprintEmailContentField,
	type BlueprintEmailContent
} from '../../../../blueprints/model';

export class BlueprintEditorState {
	private emailContentState = $state({
		activeEmailContent: {} as BlueprintEmailContent
	});
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

	constructor(content: BlueprintEmailContent) {
		this.emailContentState.activeEmailContent = normalizeBlueprintEmailContent(content);
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

	replaceEmailContent = (nextContent: BlueprintEmailContent) => {
		this.emailContentState.activeEmailContent = normalizeBlueprintEmailContent(nextContent);
		this.syncRecipientInputs();
	};

	setEmailContentField = <Key extends keyof BlueprintEmailContent>(
		field: Key,
		value: BlueprintEmailContent[Key]
	) => {
		this.replaceEmailContent(updateBlueprintEmailContentField(this.activeEmailContent, field, value));
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

		this.setEmailContentField(field, parseBlueprintRecipients(value));
	};

	commitRecipientInput = (field: 'to' | 'cc', value: string) => {
		const recipients = parseBlueprintRecipients(value);

		this.setEmailContentField(field, recipients);

		if (field === 'to') {
			this.recipientsUi.isEditingTo = false;
			this.recipientsUi.toInputText = formatBlueprintRecipients(recipients);
		} else {
			this.recipientsUi.isEditingCc = false;
			this.recipientsUi.ccInputText = formatBlueprintRecipients(recipients);
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

	addAttachment = (attachment: NonNullable<BlueprintEmailContent['attachment']>) => {
		this.attachmentUi.inputText = '';
		this.setEmailContentField('attachment', cloneBlueprintAttachment(attachment));
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

	setOpenAttachment = (attachment: NonNullable<BlueprintEmailContent['attachment']>) => {
		this.setEmailContentField('attachment', cloneBlueprintAttachment(attachment));
	};

	updateBody = (body: BlueprintEmailContent['body']) => {
		this.setEmailContentField('body', cloneBlueprintBody(body));
	};

	private syncRecipientInputs() {
		if (!this.recipientsUi.isEditingTo) {
			this.recipientsUi.toInputText = formatBlueprintRecipients(this.activeEmailContent.to);
		}

		if (!this.recipientsUi.isEditingCc) {
			this.recipientsUi.ccInputText = formatBlueprintRecipients(this.activeEmailContent.cc);
		}
	}
}
