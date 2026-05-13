<script lang="ts">
	import { cn } from '$lib/components/chrome/shared/cn';
	import BuilderGuideActions from './BuilderGuideActions.svelte';
	import OptionalAnswerInput from './inputs/OptionalAnswerInput.svelte';
	import type { BuilderGuideAnswer, BuilderGuideChoiceAnswer } from './guide-answer';
	import type { BuilderGuideQuestion } from './guide-types';

	type Props = {
		question: BuilderGuideQuestion;
		answer: BuilderGuideAnswer;
		canGoNext: boolean;
		isSubmitting: boolean;
		skipActionLabel: string;
		onNext: () => void;
		onSubmit: () => void | Promise<void>;
		onSkipRemaining: () => void | Promise<void>;
		onAnswerChange: (answer: BuilderGuideAnswer) => void;
	};

	let {
		question,
		answer,
		canGoNext,
		isSubmitting,
		skipActionLabel,
		onNext,
		onSubmit,
		onSkipRemaining,
		onAnswerChange
	}: Props = $props();
	const emptyChoiceAnswer = {
		type: 'choice',
		selectedOption: '',
		customAnswer: ''
	} satisfies BuilderGuideChoiceAnswer;
	const choiceAnswer = $derived(answer.type === 'choice' ? answer : emptyChoiceAnswer);
</script>

<div
	class={cn(
		'mt-6 flex flex-col gap-4',
		question.type === 'choice' ? 'md:flex-row md:items-end md:justify-between' : 'items-end'
	)}
>
	{#if question.type === 'choice'}
		<OptionalAnswerInput
			name={`${question.id}-custom-answer`}
			value={choiceAnswer.customAnswer}
			placeholder={question.customAnswerPlaceholder}
			onValueChange={(customAnswer) => {
				onAnswerChange({ ...choiceAnswer, customAnswer });
			}}
		/>
	{/if}

	<BuilderGuideActions
		{canGoNext}
		{isSubmitting}
		{skipActionLabel}
		{onNext}
		{onSubmit}
		{onSkipRemaining}
	/>
</div>
