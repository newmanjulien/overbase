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
	BuilderAppFinalEvent,
	BuilderAppStartTurnInput,
	BuilderAppState,
	BuilderRuntimeContext
} from '@overbase/builder-sdk/app-protocol';
import {
	createPrimaryEmailDraftArtifactSet,
	getHiddenPrimaryEmailDraftArtifact,
	getVisiblePrimaryEmailDraftArtifact,
	PRIMARY_EMAIL_DRAFT_ARTIFACT_ID
} from '@overbase/builder-sdk/artifacts';
import type { EmailDraftPatch } from '@overbase/builder-sdk/email';
import type { BuilderAppRuntime } from '@overbase/builder-sdk/host';
import type { CustomOpportunityFormatRuntimeDependencies } from './dependencies';
import { CUSTOM_EMAIL_DEFAULT_AI_CONTEXT } from './rules';
import type { CustomEmailAiContext } from './types';

type CustomEmailAppState = {
	selectedEmailExamplesSlug?: string;
	selectedEmailExampleSlug?: string;
	initialQuestionText?: string;
	aiContext?: CustomEmailAiContext;
};

type BuilderAppInitialQuestionExample = {
	slug: string;
	description: string;
	questionGuidance: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getStringField(value: Record<string, unknown>, field: string) {
	const fieldValue = value[field];

	return typeof fieldValue === 'string' ? fieldValue : undefined;
}

function getNonEmptyStringField(value: Record<string, unknown>, field: string) {
	return getStringField(value, field)?.trim() || undefined;
}

function normalizeCustomEmailAiContext(
	aiContext?: CustomEmailAiContext
): CustomEmailAiContext | undefined {
	const normalized = {
		personContext: aiContext?.personContext?.trim() || undefined,
		conversationReason: aiContext?.conversationReason?.trim() || undefined,
		formatUse: aiContext?.formatUse?.trim() || undefined
	};

	return Object.values(normalized).some(Boolean) ? normalized : undefined;
}

export function parseCustomEmailAiContextFromAppState(
	appState?: BuilderAppState
): CustomEmailAiContext | undefined {
	const value = isRecord(appState?.value) ? appState.value : {};
	const aiContext = isRecord(value.aiContext) ? value.aiContext : {};
	const parsed = {
		personContext: getNonEmptyStringField(aiContext, 'personContext'),
		conversationReason: getNonEmptyStringField(aiContext, 'conversationReason'),
		formatUse: getNonEmptyStringField(aiContext, 'formatUse')
	};

	return Object.values(parsed).some(Boolean) ? parsed : undefined;
}

function getCustomEmailAiContext(appState?: BuilderAppState) {
	const defaultAiContext = normalizeCustomEmailAiContext(CUSTOM_EMAIL_DEFAULT_AI_CONTEXT);
	const appStateAiContext = parseCustomEmailAiContextFromAppState(appState);

	return normalizeCustomEmailAiContext({
		...defaultAiContext,
		...appStateAiContext
	});
}

function getCustomEmailAppState(appState?: BuilderAppState): CustomEmailAppState {
	const value = isRecord(appState?.value) ? appState.value : {};

	return {
		selectedEmailExamplesSlug: getStringField(value, 'selectedEmailExamplesSlug'),
		selectedEmailExampleSlug: getStringField(value, 'selectedEmailExampleSlug'),
		initialQuestionText: getStringField(value, 'initialQuestionText'),
		aiContext: getCustomEmailAiContext(appState)
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

function toAssistantPatchResultEvents(result: {
	text: string;
	patch: EmailDraftPatch | null;
}): BuilderAppFinalEvent[] {
	return [
		{
			type: 'assistantComplete',
			text: result.text.trim() || (result.patch ? 'Updated the draft.' : 'No changes needed.')
		},
		{
			type: 'artifactPatch',
			artifact: {
				artifactId: PRIMARY_EMAIL_DRAFT_ARTIFACT_ID,
				kind: 'emailDraft',
				patch: result.patch
			}
		},
		{ type: 'complete' }
	];
}

export function createCustomOpportunityFormatRuntime(
	deps: CustomOpportunityFormatRuntimeDependencies
): BuilderAppRuntime {
	async function startTurn(input: BuilderAppStartTurnInput) {
		const fastOpenAIConfig = deps.getOpenAIConfig('fast');
		const examples = listCustomEmailExamples().map(toInitialQuestionExample);

		if (examples.length === 0) {
			throw new Error('No custom email examples are available.');
		}

		const customState = getCustomEmailAppState(input.appState);
		const setupPromptText = buildBuilderRunSetupPromptText(input.setup);
		const routeResult = await routeEmailBuilderRequest({
			setupPromptText,
			examples,
			aiContext: customState.aiContext,
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
		] satisfies BuilderAppFinalEvent[];
	}

	async function continueTurn(input: BuilderAppContinueTurnInput, context: BuilderRuntimeContext) {
		const openAIConfig = deps.getOpenAIConfig();
		const hiddenArtifact = getHiddenPrimaryEmailDraftArtifact(input.artifacts);

		if (hiddenArtifact) {
			const customState = getCustomEmailAppState(input.appState);
			const setupPromptText = buildBuilderRunSetupPromptText(input.setup);
			const emailDraft = await applyEmailInitialAnswer({
				setupPromptText,
				initialQuestion: customState.initialQuestionText ?? '',
				initialAnswer: input.userMessage,
				draft: hiddenArtifact.value,
				aiContext: customState.aiContext,
				openAIConfig
			});

			return [
				{
					type: 'assistantComplete',
					text: 'I adjusted the draft based on that and put it in the panel.'
				},
				{
					type: 'artifactSet',
					artifact: createPrimaryEmailDraftArtifactSet({
						value: emailDraft,
						visibility: 'visible'
					})
				},
				{ type: 'complete' }
			] satisfies BuilderAppFinalEvent[];
		}

		const visibleArtifact = getVisiblePrimaryEmailDraftArtifact(input.artifacts);

		if (!visibleArtifact) {
			throw new Error('The visible email draft is unavailable.');
		}

		const result = await streamCustomEmailBuilderTurn({
			transcript: input.transcript,
			draft: visibleArtifact.value,
			aiContext: getCustomEmailAppState(input.appState).aiContext,
			openAIConfig,
			handlers: {
				onTextDelta: async (delta) => {
					await context.emit({ type: 'assistantDelta', text: delta });
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

		const draftExamples = listCustomEmailDraftExamples(selectedEmailExamplesSlug);

		if (draftExamples.length === 0) {
			throw new Error('No custom email draft examples are available for these examples.');
		}

		const setupPromptText = buildBuilderRunSetupPromptText(input.setup);
		const adapted = await adaptEmailExample({
			setupPromptText,
			examples: toInitialQuestionExample(examples),
			draftExamples,
			aiContext: customState.aiContext,
			openAIConfig
		});

		return [
			{
				type: 'artifactSet',
				artifact: createPrimaryEmailDraftArtifactSet({
					value: adapted.emailDraft,
					visibility: 'hidden'
				})
			},
			{
				type: 'appStatePatch',
				patch: {
					selectedEmailExampleSlug: adapted.exampleSlug
				}
			},
			{ type: 'complete' }
		] satisfies BuilderAppFinalEvent[];
	}

	return {
		manifest: customEmailBuilderManifest,
		startTurn,
		continueTurn,
		backgroundJob
	};
}
