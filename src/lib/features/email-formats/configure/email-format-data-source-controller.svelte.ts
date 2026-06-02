import type { Id } from '$convex/_generated/dataModel';
import type { ContactImport } from '$lib/features/external-data/linkedin-contacts-csv';
import type { EmailFormatRuleDataSourceControl } from '$shared/email-format-definitions';
import type { EmailFormatRule } from './email-format-configure-types';

export type EmailFormatExternalDataSourceOption = {
	id: Id<'externalDataSources'>;
	kind: 'linkedinContacts';
	name: string;
	sourceFileName: string;
};

export class EmailFormatDataSourceController {
	linkExistingModalOpen = $state(false);
	uploadNewModalOpen = $state(false);
	linkError = $state<string | null>(null);
	linkingSourceId = $state<Id<'externalDataSources'> | null>(null);
	contactsImport = $state<ContactImport | null>(null);
	isUploading = $state(false);
	activeRule = $state<EmailFormatRule | null>(null);

	get activeRuleId() {
		return this.activeRule?.id ?? null;
	}

	getLinkedinContactsSources(sources: readonly EmailFormatExternalDataSourceOption[]) {
		return sources
			.filter((source) => source.kind === 'linkedinContacts')
			.map((source) => ({
				id: source.id,
				name: source.name,
				sourceFileName: source.sourceFileName
			}));
	}

	getControl(
		controls: readonly EmailFormatRuleDataSourceControl[],
		ruleId: string | null
	) {
		if (!ruleId) {
			return null;
		}

		return controls.find((control) => control.ruleId === ruleId) ?? null;
	}

	getActivationBlockerActionControl(
		controls: readonly EmailFormatRuleDataSourceControl[]
	) {
		return (
			controls.find(
				(control) => control.kind === 'linkedinContacts' && !control.disabled
			) ?? null
		);
	}

	openRule(
		controls: readonly EmailFormatRuleDataSourceControl[],
		rule: EmailFormatRule
	) {
		const control = this.getControl(controls, rule.id);

		if (!control || control.disabled) {
			return false;
		}

		this.activeRule = rule;
		this.linkError = null;

		if (control.attachMode === 'upload-new') {
			this.contactsImport = null;
			this.uploadNewModalOpen = true;
			return true;
		}

		this.linkExistingModalOpen = true;
		return true;
	}

	openActivationBlockerAction(
		controls: readonly EmailFormatRuleDataSourceControl[],
		rules: readonly EmailFormatRule[]
	) {
		const control = this.getActivationBlockerActionControl(controls);
		const rule = control ? rules.find((savedRule) => savedRule.id === control.ruleId) : null;

		return rule ? this.openRule(controls, rule) : false;
	}

	closeUploadNewModal() {
		if (this.isUploading) {
			return;
		}

		this.uploadNewModalOpen = false;
		this.activeRule = null;
		this.contactsImport = null;
	}

	closeLinkExistingModal() {
		if (this.linkingSourceId) {
			return;
		}

		this.linkExistingModalOpen = false;
		this.activeRule = null;
		this.linkError = null;
	}

	markLinkedExistingComplete() {
		this.linkExistingModalOpen = false;
		this.activeRule = null;
	}

	markUploadNewComplete() {
		this.uploadNewModalOpen = false;
		this.activeRule = null;
		this.contactsImport = null;
	}
}
