<script lang="ts">
	import type { BuilderCardRecord } from '$lib/features/builder-data';
	import BuilderGuideQuestionCard from '$lib/features/builder-guide/BuilderGuideQuestionCard.svelte';
	import {
		getGuideAnswer,
		type BuilderGuideAnswer,
		type BuilderGuideAnswersByQuestionId
	} from '$lib/features/builder-guide/guide-answer';
	import type {
		BuilderGuideDefinition,
		BuilderGuideQuestion
	} from '$lib/features/builder-guide/guide-types';

	type Props = {
		card: BuilderCardRecord;
		guide: BuilderGuideDefinition;
		onComplete: (initialMessage: string) => void;
	};

	let { card, guide, onComplete }: Props = $props();
	let currentQuestionIndex = $state(0);
	let answersByQuestionId = $state<BuilderGuideAnswersByQuestionId>({});

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
			return answer.customAnswer.trim() || answer.selectedOption || 'Not specified';
		}

		return answer.value.trim() || 'Not specified';
	}

	function buildInitialMessage() {
		const answers = guide.questions.map((question) => {
			return `${question.title}\n${getAnswerText(question)}`;
		});

		return [
			`I want to build this notification: ${card.title}`,
			'',
			'Description:',
			card.description,
			'',
			'Answers:',
			...answers.flatMap((answer) => ['', answer])
		]
			.join('\n')
			.trim();
	}

	function completeSetup() {
		onComplete(buildInitialMessage());
	}
</script>

<section class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white p-2">
	<div class="min-h-0 flex-1 overflow-y-auto px-3 py-6 md:px-5 md:py-8">
		<div class="ml-auto w-fit max-w-[80%] rounded-full bg-zinc-100 px-4 py-2 text-sm text-zinc-800">
			Help me get started with this notification
		</div>

		<div class="mt-12 max-w-3xl md:mt-16">
			<p class="text-sm leading-relaxed text-zinc-800">
				{guide.intro}
			</p>
		</div>

		<BuilderGuideQuestionCard
			question={currentQuestion}
			answer={currentAnswer}
			step={currentQuestionIndex + 1}
			totalSteps={guide.questions.length}
			{canGoPrevious}
			{canGoNext}
			onPrevious={goPrevious}
			onNext={goNext}
			onSubmit={completeSetup}
			onAnswerChange={updateAnswer}
		/>
	</div>
</section>
