<script lang="ts">
	import BuilderGuidePager from '$lib/features/builder/guide/BuilderGuidePager.svelte';
	import BuilderGuideQuestionHelp from '$lib/features/builder/guide/BuilderGuideQuestionHelp.svelte';
	import BuilderGuideQuestionBody from '$lib/features/builder/guide/BuilderGuideQuestionBody.svelte';
	import BuilderGuideQuestionFooter from '$lib/features/builder/guide/BuilderGuideQuestionFooter.svelte';
	import type { BuilderGuideAnswer } from '$lib/features/builder/guide/guide-answer';
	import type { BuilderGuideQuestion } from '$lib/features/builder/guide/guide-types';

	type Props = {
		question: BuilderGuideQuestion;
		answer: BuilderGuideAnswer;
		step: number;
		totalSteps: number;
		helpText?: string | null;
		canGoPrevious: boolean;
		canGoNext: boolean;
		isSubmitting: boolean;
		onPrevious: () => void;
		onNext: () => void;
		onSubmit: () => void | Promise<void>;
		onSkipRemaining: () => void | Promise<void>;
		onAnswerChange: (answer: BuilderGuideAnswer) => void;
	};

	let {
		question,
		answer,
		step,
		totalSteps,
		helpText = null,
		canGoPrevious,
		canGoNext,
		isSubmitting,
		onPrevious,
		onNext,
		onSubmit,
		onSkipRemaining,
		onAnswerChange
	}: Props = $props();
</script>

<div class="mt-6 rounded-sm border border-zinc-100 bg-white p-4 md:mt-8 md:p-6">
	<div class="flex items-start justify-between gap-4">
		<div class="flex min-w-0 items-center gap-1.5">
			<h2 class="min-w-0 text-[0.76rem] font-medium text-zinc-950 md:text-[0.8rem]">
				{question.title}
			</h2>
			<BuilderGuideQuestionHelp id={question.id} text={helpText} />
		</div>

		<BuilderGuidePager
			{step}
			{totalSteps}
			{canGoPrevious}
			{canGoNext}
			{onPrevious}
			{onNext}
		/>
	</div>

	<form
		class="mt-7"
		onsubmit={(event) => {
			event.preventDefault();
		}}
	>
		<fieldset>
			<legend class="sr-only">{question.title}</legend>

			<BuilderGuideQuestionBody {question} {answer} {onAnswerChange} />
			<BuilderGuideQuestionFooter
				{question}
				{answer}
				{canGoNext}
				{isSubmitting}
				{onNext}
				{onSubmit}
				{onSkipRemaining}
				{onAnswerChange}
			/>
		</fieldset>
	</form>
</div>
