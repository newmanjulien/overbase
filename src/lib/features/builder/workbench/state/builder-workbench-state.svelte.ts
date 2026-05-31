import {
	resolveBuilderContent,
	type BuilderRuleDataSourceAction,
	type BuilderRegistryEntry
} from '$lib/features/builder/catalog';
import type { BuilderStartingPointSelectionAnswers } from '$lib/features/builder/domain';
import type { EmailFormatRule } from '$lib/domain/email-format-rules';
import { BuilderEditorState } from './builder-editor-state.svelte';

export type BuilderStep = 'starting-point-selection' | 'editor';

export type BuilderVariableInsertionTarget = 'body' | 'spreadsheet';

export type BuilderVariableInsertionRequest = {
	id: number;
	variableId: string;
	target: BuilderVariableInsertionTarget;
};

export type BuilderWorkbenchSnapshot = {
	activeBuilderSlug: string;
	mode: BuilderRegistryEntry['mode'];
	step: BuilderStep;
	selectedAnswers: BuilderStartingPointSelectionAnswers;
	selectedStartingPointId: string | null;
	editor: BuilderEditorState | null;
} & (BuilderWorkbenchVariableState | BuilderWorkbenchRulesState);

export type BuilderWorkbenchVariableState = {
	mode: 'internal-data';
	pickerOpen: boolean;
	insertionSequence: number;
	insertionRequest: BuilderVariableInsertionRequest | null;
};

export type BuilderWorkbenchRulesState = {
	mode: 'public-data';
	rulesDraft: EmailFormatRule[];
};

export class BuilderWorkbenchState {
	private workbench = $state<BuilderWorkbenchSnapshot>({
		activeBuilderSlug: '',
		mode: 'internal-data',
		step: 'starting-point-selection',
		selectedAnswers: {},
		selectedStartingPointId: null,
		editor: null,
		pickerOpen: false,
		insertionSequence: 0,
		insertionRequest: null
	});

	constructor(private builder: BuilderRegistryEntry) {
		this.syncBuilder(builder);
	}

	get step() {
		return this.workbench.step;
	}

	get selectedAnswers() {
		return this.workbench.selectedAnswers;
	}

	get editor() {
		return this.workbench.editor;
	}

	get variablePickerOpen() {
		return this.workbench.mode === 'internal-data' ? this.workbench.pickerOpen : false;
	}

	get rulesDraft() {
		return this.workbench.mode === 'public-data' ? this.workbench.rulesDraft : [];
	}

	get ruleDataSourceAction(): BuilderRuleDataSourceAction | null {
		if (this.workbench.mode !== 'public-data' || this.builder.mode !== 'public-data') {
			return null;
		}

		const selectedStartingPoint = this.builder.startingPoints.find(
			(startingPoint) => startingPoint.id === this.workbench.selectedStartingPointId
		);

		return selectedStartingPoint?.ruleDataSourceAction ?? this.builder.ruleDataSourceAction;
	}

	get variableInsertionRequest() {
		return this.workbench.mode === 'internal-data' ? this.workbench.insertionRequest : null;
	}

	get title() {
		return this.workbench.editor?.activeEmailContent.title ?? this.builder.title;
	}

	syncBuilder(builder: BuilderRegistryEntry) {
		if (this.workbench.activeBuilderSlug === builder.slug) {
			this.builder = builder;
			return;
		}

		this.builder = builder;
		this.workbench.activeBuilderSlug = builder.slug;
		this.resetForBuilder();
	}

	updateAnswers = (answers: BuilderStartingPointSelectionAnswers) => {
		this.workbench.selectedAnswers = answers;
	};

	continueToEditor = (answers = this.workbench.selectedAnswers) => {
		this.workbench.selectedAnswers = answers;
		const editorState = this.createEditorState(answers);

		if (!editorState) {
			return;
		}

		this.workbench.editor = editorState.editor;
		this.workbench.selectedStartingPointId = editorState.startingPointId;
		if (this.workbench.mode === 'public-data' && this.builder.mode === 'public-data') {
			this.workbench.rulesDraft = cloneRules(this.builder.initialRules);
		}
		this.workbench.step = 'editor';
	};

	updateTitle = (nextTitle: string) => {
		if (
			this.builder.mode === 'internal-data' &&
			this.workbench.step === 'editor' &&
			this.workbench.editor
		) {
			this.workbench.editor.updateTitle(nextTitle);
		}
	};

	updateRules = (rules: EmailFormatRule[]) => {
		if (this.workbench.mode === 'public-data') {
			this.workbench.rulesDraft = cloneRules(rules);
		}
	};

	openVariablePicker = () => {
		if (this.workbench.mode === 'internal-data') {
			this.workbench.pickerOpen = true;
		}
	};

	closeVariablePicker = () => {
		if (this.workbench.mode === 'internal-data') {
			this.workbench.pickerOpen = false;
		}
	};

	requestVariableInsertion = (variableId: string) => {
		if (this.workbench.mode !== 'internal-data') {
			return;
		}

		this.workbench.insertionSequence += 1;
		this.workbench.insertionRequest = {
			id: this.workbench.insertionSequence,
			variableId,
			target: this.getVariableInsertionTarget()
		};
	};

	clearVariableInsertionRequest = (requestId: number) => {
		if (
			this.workbench.mode === 'internal-data' &&
			this.workbench.insertionRequest?.id === requestId
		) {
			this.workbench.insertionRequest = null;
		}
	};

	private resetForBuilder() {
		const editorState =
			this.builder.startingPointSelection.kind === 'fixed-starting-point'
				? this.createEditorState({})
				: null;
		const editor = editorState?.editor ?? null;
		const selectedStartingPointId = editorState?.startingPointId ?? null;
		const step = editor ? 'editor' : 'starting-point-selection';

		if (this.builder.mode === 'public-data') {
			this.workbench = {
				activeBuilderSlug: this.builder.slug,
				mode: 'public-data',
				step,
				selectedAnswers: {},
				selectedStartingPointId,
				editor,
				rulesDraft: cloneRules(this.builder.initialRules)
			};
			return;
		}

		this.workbench = {
			activeBuilderSlug: this.builder.slug,
			mode: 'internal-data',
			step,
			selectedAnswers: {},
			selectedStartingPointId,
			editor,
			pickerOpen: false,
			insertionSequence: 0,
			insertionRequest: null
		};
	}

	private createEditorState(answers: BuilderStartingPointSelectionAnswers) {
		const startingPoint = resolveBuilderContent(this.builder, answers);

		return startingPoint
			? {
					editor: new BuilderEditorState(startingPoint.emailContent),
					startingPointId: startingPoint.id
				}
			: null;
	}

	private getVariableInsertionTarget(): BuilderVariableInsertionTarget {
		const editor = this.workbench.editor;

		return editor?.isAttachmentOpen && editor.activeEmailContent.attachment
			? 'spreadsheet'
			: 'body';
	}
}

function cloneRules(rules: readonly EmailFormatRule[]) {
	return rules.map((rule) => ({ ...rule }));
}
