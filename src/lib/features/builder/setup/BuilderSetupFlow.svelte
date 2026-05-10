<script lang="ts">
	import {
		createGuidedRunSetup,
		type BuilderGuideSetupAction,
		type BuilderRunSetup
	} from '@overbase/builder-sdk/app-protocol';
	import type { BuilderAppRecord } from '$lib/features/builder/data';
	import BuilderGuideQuestionCard from '$lib/features/builder/guide/BuilderGuideQuestionCard.svelte';
	import {
		getGuideAnswer,
		type BuilderGuideAnswer,
		type BuilderGuideAnswersByQuestionId
	} from '$lib/features/builder/guide/guide-answer';
	import type {
		BuilderGuideDefinition,
		BuilderGuideQuestion
	} from '$lib/features/builder/guide/guide-types';

	type Props = {
		app: BuilderAppRecord;
		guide: BuilderGuideDefinition;
		onComplete: (setup: BuilderRunSetup) => Promise<void>;
	};

	let { app, guide, onComplete }: Props = $props();
	let currentQuestionIndex = $state(0);
	let answersByQuestionId = $state<BuilderGuideAnswersByQuestionId>({});
	let submitError = $state<string | null>(null);
	let isSubmitting = $state(false);

	const currentQuestion = $derived(guide.questions[currentQuestionIndex]);
	const currentAnswer = $derived(getGuideAnswer(answersByQuestionId, currentQuestion));
	const canGoPrevious = $derived(currentQuestionIndex > 0);
	const canGoNext = $derived(currentQuestionIndex < guide.questions.length - 1);

	function updateAnswer(answer: BuilderGuideAnswer) {
		answersByQuestionId = {
			...answersByQuestionId,
			[currentQuestion.id]: answer
		};
	}

	function goPrevious() {
		if (!canGoPrevious) {
			return;
		}

		currentQuestionIndex -= 1;
	}

	function goNext() {
		if (!canGoNext) {
			return;
		}

		currentQuestionIndex += 1;
	}

	function getAnswerText(question: BuilderGuideQuestion) {
		const answer = getGuideAnswer(answersByQuestionId, question);

		if (answer.type === 'choice') {
			return answer.customAnswer.trim() || answer.selectedOption.trim();
		}

		return answer.value.trim();
	}

	function buildRunSetup(action: BuilderGuideSetupAction) {
		return createGuidedRunSetup({
			title: app.title,
			description: app.description,
			guide,
			action,
			answers: guide.questions.map((question) => ({
				questionId: question.id,
				questionTitle: question.title,
				answer: getAnswerText(question)
			}))
		});
	}

	function getErrorMessage(error: unknown) {
		return error instanceof Error ? error.message : 'Something went wrong.';
	}

	async function completeSetup(action: BuilderGuideSetupAction) {
		if (isSubmitting) {
			return;
		}

		isSubmitting = true;
		submitError = null;

		try {
			await onComplete(buildRunSetup(action));
		} catch (error) {
			submitError = getErrorMessage(error);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<section class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white p-2">
	<div class="min-h-0 flex-1 overflow-y-auto px-3 py-6 md:px-5 md:py-8">
		<div class="ml-auto w-fit max-w-[80%] rounded-full bg-zinc-100 px-4 py-2 text-[0.82rem] text-zinc-800">
			Help me get started with this notification
		</div>

		<div class="mt-12 max-w-3xl md:mt-16">
			<p class="text-[0.82rem] leading-[1.55] text-zinc-800">
				{guide.intro}
			</p>
		</div>

		<BuilderGuideQuestionCard
			question={currentQuestion}
			answer={currentAnswer}
			step={currentQuestionIndex + 1}
			totalSteps={guide.questions.length}
			helpText={currentQuestion.helpText ?? null}
			{canGoPrevious}
			{canGoNext}
			{isSubmitting}
			onPrevious={goPrevious}
			onNext={goNext}
			onSubmit={() => completeSetup('submitted')}
			onSkipRemaining={() => completeSetup('skippedRemaining')}
			onAnswerChange={updateAnswer}
		/>

		{#if submitError}
			<div class="mt-4 max-w-3xl rounded-sm border border-red-200 bg-red-50 p-3 text-[0.78rem] text-red-700">
				{submitError}
			</div>
		{/if}
	</div>
</section>
