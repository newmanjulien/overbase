import {
	adaptEmailExample,
	applyEmailInitialAnswer,
	routeEmailBuilderRequest,
	streamCustomEmailBuilderTurn
} from './engine';
import { customEmailBuilderManifest } from './definition';
import {
	getCustomEmailExamples,
	listCustomEmailDraftExamples,
	listCustomEmailExamples
} from './examples';
import { buildBuilderRunSetupPromptText } from '@overbase/builder-sdk/app-protocol';
import type {
	BuilderAppBackgroundJobInput,
	BuilderAppContinueTurnInput,
	BuilderAppOutputEvent,
	BuilderAppStartTurnInput,
	BuilderAppState
} from '@overbase/builder-sdk/app-protocol';
import type { EmailDraft, EmailDraftPatch } from '@overbase/builder-sdk/email';
import type { BuilderAppRuntime } from '@overbase/builder-sdk/host';
import type { CustomNotificationRuntimeDependencies } from './dependencies';

type EmitEvent = (event: BuilderAppOutputEvent) => Promise<void> | void;

type CustomEmailAppState = {
	selectedEmailExamplesSlug?: string;
	selectedEmailExampleSlug?: string;
	initialQuestionText?: string;
};

type BuilderAppInitialQuestionExample = {
	slug: string;
	description: string;
	questionGuidance: string;
};

type BuilderAppDraftExample = {
	slug: string;
	description: string;
	matchSignals: string[];
	emailDraft: EmailDraft;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getStringField(value: Record<string, unknown>, field: string) {
	const fieldValue = value[field];

	return typeof fieldValue === 'string' ? fieldValue : undefined;
}

function getCustomEmailAppState(appState?: BuilderAppState): CustomEmailAppState {
	const value = isRecord(appState?.value) ? appState.value : {};

	return {
		selectedEmailExamplesSlug: getStringField(value, 'selectedEmailExamplesSlug'),
		selectedEmailExampleSlug: getStringField(value, 'selectedEmailExampleSlug'),
		initialQuestionText: getStringField(value, 'initialQuestionText')
	};
}

function toInitialQuestionExample(examples: {
	slug: string;
	description: string;
	questionGuidance: string;
}): BuilderAppInitialQuestionExample {
	return {
		slug: examples.slug,
		description: examples.description,
		questionGuidance: examples.questionGuidance
	};
}

function toDraftExample(example: {
	slug: string;
	description: string;
	matchSignals: string[];
	emailDraft: EmailDraft;
}): BuilderAppDraftExample {
	return {
		slug: example.slug,
		description: example.description,
		matchSignals: example.matchSignals,
		emailDraft: example.emailDraft
	};
}

function toAssistantPatchResultEvents(result: {
	text: string;
	patch: EmailDraftPatch | null;
}): BuilderAppOutputEvent[] {
	return [
		{
			type: 'assistantComplete',
			text: result.text.trim() || (result.patch ? 'Updated the draft.' : 'No changes needed.')
		},
		{
			type: 'emailDraftPatch',
			patch: result.patch
		},
		{ type: 'complete' }
	];
}

export function createCustomNotificationRuntime(
	deps: CustomNotificationRuntimeDependencies
): BuilderAppRuntime {
	async function startTurn(input: BuilderAppStartTurnInput) {
		const fastOpenAIConfig = deps.getOpenAIConfig('fast');
		const examples = listCustomEmailExamples().map(toInitialQuestionExample);

		if (examples.length === 0) {
			throw new Error('No custom email examples are available.');
		}

		const setupPromptText = buildBuilderRunSetupPromptText(input.setup);
		const routeResult = await routeEmailBuilderRequest({
			setupPromptText,
			examples,
			openAIConfig: fastOpenAIConfig
		});
		const selectedExamples =
			examples.find((candidate) => candidate.slug === routeResult.examplesSlug) ?? examples[0];
		const questionText = routeResult.publicQuestion;

		return [
			{ type: 'assistantComplete', text: questionText },
			{
				type: 'appStatePatch',
				patch: {
					selectedEmailExamplesSlug: selectedExamples.slug,
					initialQuestionText: questionText
				}
			},
			{ type: 'enqueueBackgroundJob' },
			{ type: 'waitForUser' },
			{ type: 'complete' }
		] satisfies BuilderAppOutputEvent[];
	}

	async function continueTurn(input: BuilderAppContinueTurnInput, emit?: EmitEvent) {
		const openAIConfig = deps.getOpenAIConfig();
		const draftState = input.emailDraftState;

		if (draftState?.visibility === 'hidden') {
			const customState = getCustomEmailAppState(input.appState);
			const setupPromptText = buildBuilderRunSetupPromptText(input.setup);
			const emailDraft = await applyEmailInitialAnswer({
				setupPromptText,
				initialQuestion: customState.initialQuestionText ?? '',
				initialAnswer: input.userMessage,
				draft: draftState.draft,
				openAIConfig
			});

			return [
				{
					type: 'assistantComplete',
					text: 'I adjusted the draft based on that and put it in the panel.'
				},
				{ type: 'emailDraftSet', emailDraft, visibility: 'visible' },
				{ type: 'complete' }
			] satisfies BuilderAppOutputEvent[];
		}

		if (draftState?.visibility !== 'visible') {
			throw new Error('The visible email draft is unavailable.');
		}

		const result = await streamCustomEmailBuilderTurn({
			transcript: input.transcript,
			draft: draftState.draft,
			openAIConfig,
			handlers: {
				onTextDelta: async (delta) => {
					await emit?.({ type: 'assistantDelta', text: delta });
					await input.handlers.onAssistantDelta?.(delta);
				}
			}
		});

		return toAssistantPatchResultEvents(result);
	}

	async function backgroundJob(input: BuilderAppBackgroundJobInput) {
		const openAIConfig = deps.getOpenAIConfig();
		const customState = getCustomEmailAppState(input.appState);
		const selectedEmailExamplesSlug = customState.selectedEmailExamplesSlug;

		if (!selectedEmailExamplesSlug) {
			throw new Error('The selected examples are unavailable.');
		}

		const examples = getCustomEmailExamples(selectedEmailExamplesSlug);

		if (!examples) {
			throw new Error('The selected examples are unavailable.');
		}

		const draftExamples = listCustomEmailDraftExamples(selectedEmailExamplesSlug).map(toDraftExample);

		if (draftExamples.length === 0) {
			throw new Error('No custom email draft examples are available for these examples.');
		}

		const setupPromptText = buildBuilderRunSetupPromptText(input.setup);
		const adapted = await adaptEmailExample({
			setupPromptText,
			examples: toInitialQuestionExample(examples),
			draftExamples,
			openAIConfig
		});

		return [
			{
				type: 'emailDraftSet',
				emailDraft: adapted.emailDraft,
				visibility: 'hidden'
			},
			{
				type: 'appStatePatch',
				patch: {
					selectedEmailExampleSlug: adapted.exampleSlug
				}
			},
			{ type: 'complete' }
		] satisfies BuilderAppOutputEvent[];
	}

	return {
		manifest: customEmailBuilderManifest,
		startTurn,
		continueTurn,
		backgroundJob
	};
}
