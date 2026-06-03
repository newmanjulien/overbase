import {
	readLinkedinContactsCsvFile,
	type ContactImport
} from './linkedin-contacts-upload';

type LinkedinContactsUploadStateOptions = {
	clearImportOnSelect?: boolean;
	readErrorText?: string;
};

export class LinkedinContactsUploadState {
	selectedFile = $state<File | null>(null);
	contactsImport = $state<ContactImport | null>(null);
	errorText = $state<string | null>(null);
	parsing = $state(false);

	constructor(private readonly options: LinkedinContactsUploadStateOptions = {}) {}

	reset() {
		this.selectedFile = null;
		this.contactsImport = null;
		this.errorText = null;
		this.parsing = false;
	}

	setErrorText(errorText: string | null) {
		this.errorText = errorText;
	}

	async selectFile(file: File) {
		this.selectedFile = file;
		this.errorText = null;
		this.parsing = true;

		if (this.options.clearImportOnSelect) {
			this.contactsImport = null;
		}

		try {
			this.contactsImport = await readLinkedinContactsCsvFile(file);
		} catch (error) {
			this.contactsImport = null;
			this.errorText =
				error instanceof Error
					? error.message
					: (this.options.readErrorText ?? 'Could not read this CSV.');
		} finally {
			this.parsing = false;
		}
	}
}
