import {
	adaptEmailExample,
	applyEmailInitialAnswer,
	getCustomEmailExamples,
	listCustomEmailDraftExamples,
	listCustomEmailExamples,
	routeEmailBuilderRequest,
	streamCustomEmailBuilderTurn,
	streamEmailInitialQuestion
} from '../external/custom';
import { bringTheFirmApp } from '../external/bring-the-firm';
import { crossSellingApp } from '../external/cross-selling';
import { reasonsToConnectApp } from '../external/reasons-to-connect';
import { whitespaceFinderApp } from '../external/whitespace-finder';
import { customEmailBuilderCatalog } from '../external/custom/definition';
import type { EmailDraft, EmailDraftPatch } from '@overbase/builder-sdk/email';
import type {
	BuilderAppOutputEvent,
	BuilderAppRuntime,
	BuilderAppState,
	EmailAppDefinition
} from '@overbase/builder-sdk/app-protocol';

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

const guidedEmailApps = [
	bringTheFirmApp,
	whitespaceFinderApp,
	reasonsToConnectApp,
	crossSellingApp
];

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getStringField(value: Record<string, unknown>, field: string) {
	const fieldValue = value[field];

	return typeof fieldValue === 'string' ? fieldValue : undefined;
}

function getInitialQuestionText(appState?: BuilderAppState) {
	const value = isRecord(appState?.value) ? appState.value : {};

	return getStringField(value, 'initialQuestionText') ?? '';
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
	patchIntent: 'none' | 'noop' | 'meaningful';
}): BuilderAppOutputEvent[] {
	return [
		{
			type: 'assistantComplete',
			text:
				result.text.trim() ||
				(result.patchIntent === 'meaningful'
					? 'Updated the draft.'
					: result.patchIntent === 'noop'
						? 'No changes needed.'
						: '')
		},
		{
			type: 'emailDraftPatch',
			patch: result.patch,
			patchIntent: result.patchIntent
		},
		{ type: 'complete' }
	];
}

function createGuidedEmailRuntime(app: EmailAppDefinition): BuilderAppRuntime {
	return {
		manifest: app,
		startTurn: async ({ initialMessage, handlers }) => {
			const questionText = await app.createInitialQuestion({
				initialMessage,
				handlers
			});

			return [
				{ type: 'assistantComplete', text: questionText },
				{
					type: 'appStatePatch',
					patch: {
						initialQuestionText: questionText
					}
				},
				{ type: 'enqueueBackgroundJob' },
				{ type: 'waitForUser' },
				{ type: 'complete' }
			];
		},
		continueTurn: async ({
			initialMessage,
			userMessage,
			transcript,
			emailDraft,
			preparedEmailDraft,
			recentEvents,
			appState,
			handlers
		}) => {
			if (!emailDraft && preparedEmailDraft) {
				const emailDraft = await app.applyInitialAnswer({
					initialMessage,
					initialQuestion: getInitialQuestionText(appState),
					initialAnswer: userMessage,
					draft: preparedEmailDraft
				});

				return [
					{
						type: 'assistantComplete',
						text: 'I adjusted the draft based on that and put it in the panel.'
					},
					{ type: 'emailDraftReplace', emailDraft },
					{ type: 'complete' }
				];
			}

			if (!emailDraft) {
				throw new Error('The visible email draft is unavailable.');
			}

			const result = await app.streamRefinementTurn({
				transcript,
				draft: emailDraft,
				recentEvents,
				handlers: {
					onTextDelta: async (delta) => {
						await handlers.onAssistantDelta?.(delta);
					}
				}
			});

			return toAssistantPatchResultEvents(result);
		},
		runBackgroundJob: async ({ initialMessage }) => {
			const emailDraft = await app.createInitialDraft({ initialMessage });

			return [
				{
					type: 'emailDraftReplace',
					emailDraft,
					visible: false
				},
				{ type: 'complete' }
			];
		}
	};
}

const customEmailRuntime = {
	manifest: customEmailBuilderCatalog,
	startTurn: async ({ initialMessage, handlers }) => {
		const examples = listCustomEmailExamples().map(toInitialQuestionExample);

		if (examples.length === 0) {
			throw new Error('No custom email examples are available.');
		}

		const routeResult = await routeEmailBuilderRequest({
			initialMessage,
			examples
		});
		const selectedExamples =
			examples.find((candidate) => candidate.slug === routeResult.examplesSlug) ?? examples[0];
		const questionText = await streamEmailInitialQuestion({
			initialMessage,
			examples: selectedExamples,
			proposedQuestion: routeResult.question,
			handlers: {
				onDelta: async (delta) => {
					await handlers.onAssistantDelta?.(delta);
				}
			}
		});

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
		];
	},
	continueTurn: async ({
		initialMessage,
		userMessage,
		transcript,
		emailDraft,
		preparedEmailDraft,
		recentEvents,
		appState,
		handlers
	}) => {
		if (!emailDraft && preparedEmailDraft) {
			const customState = getCustomEmailAppState(appState);
			const emailDraft = await applyEmailInitialAnswer({
				initialMessage,
				initialQuestion: customState.initialQuestionText ?? '',
				initialAnswer: userMessage,
				draft: preparedEmailDraft
			});

			return [
				{
					type: 'assistantComplete',
					text: 'I adjusted the draft based on that and put it in the panel.'
				},
				{ type: 'emailDraftReplace', emailDraft },
				{ type: 'complete' }
			];
		}

		if (!emailDraft) {
			throw new Error('The visible email draft is unavailable.');
		}

		const result = await streamCustomEmailBuilderTurn({
			transcript,
			draft: emailDraft,
			recentEvents,
			handlers: {
				onTextDelta: async (delta) => {
					await handlers.onAssistantDelta?.(delta);
				}
			}
		});

		return toAssistantPatchResultEvents(result);
	},
	runBackgroundJob: async ({ initialMessage, appState }) => {
		const customState = getCustomEmailAppState(appState);
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

		const adapted = await adaptEmailExample({
			initialMessage,
			examples: toInitialQuestionExample(examples),
			draftExamples
		});

		return [
			{
				type: 'emailDraftReplace',
				emailDraft: adapted.emailDraft,
				visible: false
			},
			{
				type: 'appStatePatch',
				patch: {
					selectedEmailExampleSlug: adapted.exampleSlug
				}
			},
			{ type: 'complete' }
		];
	}
} satisfies BuilderAppRuntime;

const builderAppRuntimes: BuilderAppRuntime[] = [
	...guidedEmailApps.map(createGuidedEmailRuntime),
	customEmailRuntime
];

export function getBuilderAppRuntime(slug: string) {
	return builderAppRuntimes.find((runtime) => runtime.manifest.slug === slug) ?? null;
}
