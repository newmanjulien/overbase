<script lang="ts">
	import BuilderGuideQuestionCard from '$lib/features/builder-guide/BuilderGuideQuestionCard.svelte';
	import {
		getGuideAnswer,
		type BuilderGuideAnswer,
		type BuilderGuideAnswersByQuestionId
	} from '$lib/features/builder-guide/guide-answer';
	import type { BuilderGuideDefinition } from '$lib/features/builder-guide/guide-types';

	type Props = {
		guide: BuilderGuideDefinition;
	};

	let { guide }: Props = $props();
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
</script>

<BuilderGuideQuestionCard
	question={currentQuestion}
	answer={currentAnswer}
	step={currentQuestionIndex + 1}
	totalSteps={guide.questions.length}
	{canGoPrevious}
	{canGoNext}
	onPrevious={goPrevious}
	onNext={goNext}
	onAnswerChange={updateAnswer}
/>
