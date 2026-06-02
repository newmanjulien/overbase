import {
	resolveFormatStarterContent,
	type FormatStarter
} from '$lib/features/format-starters/catalog';
import type { Id } from '$convex/_generated/dataModel';
import {
	getEmailFormatSpec,
	type EmailFormatRuleDataSourceControl,
	type EmailFormatSpec
} from '$shared/email-format-definitions';
import type {
	FormatInlineNode,
	FormatSpreadsheetAttachment,
	FormatStarterSelectionAnswers
} from '$lib/features/format-starters/domain';
import type { EmailFormatRule } from '$lib/domain/email-format-rules';
import { FormatContentEditorState } from './format-content-editor-state.svelte';

export type FormatCreatorStep = 'starting-point-selection' | 'editor';

export type FormatVariableInsertionTarget = 'body' | 'spreadsheet';

export type FormatVariableInsertionRequest = {
	id: number;
	variableId: string;
	target: FormatVariableInsertionTarget;
};

export type FormatCreatorSnapshot = {
	activeFormatStarterSlug: string;
	mode: FormatStarter['mode'];
	step: FormatCreatorStep;
	selectedAnswers: FormatStarterSelectionAnswers;
	selectedStartingPointId: string | null;
	selectedVariantSlug: string | null;
	editor: FormatContentEditorState | null;
} & (FormatCreatorVariableState | FormatCreatorRulesState);

export type FormatCreatorVariableState = {
	mode: 'internal-data';
	pickerOpen: boolean;
	insertionSequence: number;
	insertionRequest: FormatVariableInsertionRequest | null;
};

export type FormatCreatorRulesState = {
	mode: 'public-data';
	rulesDraft: EmailFormatRule[];
};

export type CreateEmailFormatRecipientRef =
	| {
			kind: 'user';
			userId: Id<'users'>;
	  }
	| {
			kind: 'teammate';
			teammateId: Id<'teammates'>;
	  };

export type CreateEmailFormatFromStarterInput = {
	formatDefinitionSlug: string;
	createdFromStarterSlug: string;
	variantSlug: string;
	selectedAnswers: FormatStarterSelectionAnswers;
	title: string;
	to: string[];
	cc: string[];
	attachment: {
		filename: string;
		cellsByKey: Record<string, FormatInlineNode[]>;
	} | null;
	body: Array<{
		id: string;
		type: 'paragraph';
		content: FormatInlineNode[];
	}>;
	recipientRefs: CreateEmailFormatRecipientRef[];
	rules: EmailFormatRule[];
	externalDataImport: {
		kind: 'linkedinContacts';
		fileName: string;
		contacts: Array<{
			firstName: string;
			lastName: string;
			fullName: string;
			company: string;
			position: string;
			profileUrl: string;
			email: string;
			connectedOn: string;
			sourceRowNumber: number;
		}>;
	} | null;
};

export type CreateFormatInputOptions = {
	viewerUserId: Id<'users'> | null;
	externalDataImport: CreateEmailFormatFromStarterInput['externalDataImport'];
};

export class FormatCreatorState {
	private creator = $state<FormatCreatorSnapshot>({
		activeFormatStarterSlug: '',
		mode: 'internal-data',
		step: 'starting-point-selection',
		selectedAnswers: {},
		selectedStartingPointId: null,
		selectedVariantSlug: null,
		editor: null,
		pickerOpen: false,
		insertionSequence: 0,
		insertionRequest: null
	});

	constructor(private formatStarter: FormatStarter) {
		this.syncFormatStarter(formatStarter);
	}

	get step() {
		return this.creator.step;
	}

	get selectedAnswers() {
		return this.creator.selectedAnswers;
	}

	get selectedStartingPointId() {
		return this.creator.selectedStartingPointId;
	}

	get selectedVariantSlug() {
		return this.creator.selectedVariantSlug;
	}

	get editor() {
		return this.creator.editor;
	}

	get variablePickerOpen() {
		return this.creator.mode === 'internal-data' ? this.creator.pickerOpen : false;
	}

	get rulesDraft() {
		return this.creator.mode === 'public-data' ? this.creator.rulesDraft : [];
	}

	get selectedFormatSpec(): EmailFormatSpec | null {
		const variantSlug = this.creator.selectedVariantSlug;

		return variantSlug
			? getEmailFormatSpec(this.formatStarter.formatDefinitionSlug, variantSlug)
			: null;
	}

	get dataSourceControls(): EmailFormatRuleDataSourceControl[] {
		if (this.creator.mode !== 'public-data' || this.formatStarter.mode !== 'public-data') {
			return [];
		}

		return (
			this.selectedFormatSpec?.dataSourceRequirements.map((requirement) => ({
				ruleId: requirement.ruleId,
				kind: requirement.kind,
				attachMode: requirement.attachMode,
				actionLabel: requirement.actionLabel,
				disabled: false
			})) ?? []
		);
	}

	get variableInsertionRequest() {
		return this.creator.mode === 'internal-data' ? this.creator.insertionRequest : null;
	}

	get title() {
		return this.creator.editor?.activeEmailContent.title ?? this.formatStarter.title;
	}

	get canCreateFormat() {
		return (
			this.creator.step === 'editor' &&
			this.creator.editor !== null &&
			this.selectedFormatSpec !== null
		);
	}

	syncFormatStarter(formatStarter: FormatStarter) {
		if (this.creator.activeFormatStarterSlug === formatStarter.slug) {
			this.formatStarter = formatStarter;
			return;
		}

		this.formatStarter = formatStarter;
		this.creator.activeFormatStarterSlug = formatStarter.slug;
		this.resetForFormatStarter();
	}

	updateAnswers = (answers: FormatStarterSelectionAnswers) => {
		this.creator.selectedAnswers = answers;
	};

	continueToEditor = (answers = this.creator.selectedAnswers) => {
		this.creator.selectedAnswers = answers;
		const editorState = this.createEditorState(answers);

		if (!editorState) {
			return;
		}

		this.creator.editor = editorState.editor;
		this.creator.selectedStartingPointId = editorState.startingPointId;
		this.creator.selectedVariantSlug = editorState.variantSlug;
		if (this.creator.mode === 'public-data' && this.formatStarter.mode === 'public-data') {
			const selectedFormatSpec = this.selectedFormatSpec;
			this.creator.rulesDraft = cloneRules(selectedFormatSpec?.initialRules ?? []);
		}
		this.creator.step = 'editor';
	};

	updateTitle = (nextTitle: string) => {
		if (
			this.formatStarter.mode === 'internal-data' &&
			this.creator.step === 'editor' &&
			this.creator.editor
		) {
			this.creator.editor.updateTitle(nextTitle);
		}
	};

	updateRules = (rules: EmailFormatRule[]) => {
		if (this.creator.mode === 'public-data') {
			this.creator.rulesDraft = cloneRules(rules);
		}
	};

	createFormatInput = ({
		viewerUserId,
		externalDataImport
	}: CreateFormatInputOptions): CreateEmailFormatFromStarterInput | null => {
		const editor = this.creator.editor;

		if (!editor) {
			return null;
		}

		if (!this.creator.selectedVariantSlug) {
			return null;
		}

		const content = editor.activeEmailContent;
		const recipientRefs = this.createInitialRecipientRefs(viewerUserId);

		if (!recipientRefs) {
			return null;
		}

		return {
			formatDefinitionSlug: this.formatStarter.formatDefinitionSlug,
			createdFromStarterSlug: this.formatStarter.slug,
			variantSlug: this.creator.selectedVariantSlug,
			selectedAnswers: { ...this.creator.selectedAnswers },
			title: content.title,
			to: [...content.to],
			cc: [...content.cc],
			attachment: clonePublishAttachment(content.attachment),
			body: content.body.map((block) => ({
				id: block.id,
				type: block.type,
				content: cloneInlineNodes(block.content)
			})),
			recipientRefs,
			rules: this.creator.mode === 'public-data' ? cloneRules(this.creator.rulesDraft) : [],
			externalDataImport
		};
	};

	openVariablePicker = () => {
		if (this.creator.mode === 'internal-data') {
			this.creator.pickerOpen = true;
		}
	};

	closeVariablePicker = () => {
		if (this.creator.mode === 'internal-data') {
			this.creator.pickerOpen = false;
		}
	};

	requestVariableInsertion = (variableId: string) => {
		if (this.creator.mode !== 'internal-data') {
			return;
		}

		this.creator.insertionSequence += 1;
		this.creator.insertionRequest = {
			id: this.creator.insertionSequence,
			variableId,
			target: this.getVariableInsertionTarget()
		};
	};

	clearVariableInsertionRequest = (requestId: number) => {
		if (
			this.creator.mode === 'internal-data' &&
			this.creator.insertionRequest?.id === requestId
		) {
			this.creator.insertionRequest = null;
		}
	};

	private resetForFormatStarter() {
		const editorState =
			this.formatStarter.startingPointSelection.kind === 'fixed-starting-point'
				? this.createEditorState({})
				: null;
		const editor = editorState?.editor ?? null;
		const selectedStartingPointId = editorState?.startingPointId ?? null;
		const selectedVariantSlug = editorState?.variantSlug ?? null;
		const step = editor ? 'editor' : 'starting-point-selection';

		if (this.formatStarter.mode === 'public-data') {
			const initialRules = selectedVariantSlug
				? (getEmailFormatSpec(this.formatStarter.formatDefinitionSlug, selectedVariantSlug)
						?.initialRules ?? [])
				: [];

			this.creator = {
				activeFormatStarterSlug: this.formatStarter.slug,
				mode: 'public-data',
				step,
				selectedAnswers: {},
				selectedStartingPointId,
				selectedVariantSlug,
				editor,
				rulesDraft: cloneRules(initialRules)
			};
			return;
		}

		this.creator = {
			activeFormatStarterSlug: this.formatStarter.slug,
			mode: 'internal-data',
			step,
			selectedAnswers: {},
			selectedStartingPointId,
			selectedVariantSlug,
			editor,
			pickerOpen: false,
			insertionSequence: 0,
			insertionRequest: null
		};
	}

	private createEditorState(answers: FormatStarterSelectionAnswers) {
		const startingPoint = resolveFormatStarterContent(this.formatStarter, answers);

		if (
			!startingPoint ||
			!getEmailFormatSpec(this.formatStarter.formatDefinitionSlug, startingPoint.variantSlug)
		) {
			return null;
		}

		return {
			editor: new FormatContentEditorState(startingPoint.emailContent),
			startingPointId: startingPoint.id,
			variantSlug: startingPoint.variantSlug
		};
	}

	private createInitialRecipientRefs(
		viewerUserId: Id<'users'> | null
	): CreateEmailFormatRecipientRef[] | null {
		if (this.selectedFormatSpec?.initialRecipients !== 'viewer') {
			return [];
		}

		return viewerUserId ? [{ kind: 'user', userId: viewerUserId }] : null;
	}

	private getVariableInsertionTarget(): FormatVariableInsertionTarget {
		const editor = this.creator.editor;

		return editor?.isAttachmentOpen && editor.activeEmailContent.attachment
			? 'spreadsheet'
			: 'body';
	}
}

function cloneRules(rules: readonly EmailFormatRule[]) {
	return rules.map((rule) => ({ ...rule }));
}

function cloneInlineNodes(nodes: readonly FormatInlineNode[]): FormatInlineNode[] {
	return nodes.map((node) =>
		node.type === 'text'
			? {
					type: 'text',
					text: node.text
				}
			: {
					type: 'variable',
					variableId: node.variableId
				}
	);
}

function clonePublishAttachment(attachment: FormatSpreadsheetAttachment | null) {
	return attachment
		? {
				filename: attachment.filename,
				cellsByKey: Object.fromEntries(
					Object.entries(attachment.cellsByKey).map(([key, cell]) => [
						key,
						cloneInlineNodes(cell)
					])
				) as Record<string, FormatInlineNode[]>
			}
		: null;
}
