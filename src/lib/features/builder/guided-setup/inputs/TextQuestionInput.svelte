<script lang="ts">
	import type { BuilderGuideAnswer, BuilderGuideTextAnswer } from '../guide-answer';
	import type { BuilderGuideTextQuestion } from '../guide-types';

	type Props = {
		question: BuilderGuideTextQuestion;
		answer: BuilderGuideTextAnswer;
		onAnswerChange: (answer: BuilderGuideAnswer) => void;
	};

	let { question, answer, onAnswerChange }: Props = $props();
</script>

<textarea
	name={question.id}
	rows={4}
	value={answer.value}
	aria-label={question.title}
	oninput={(event) => {
		onAnswerChange({ ...answer, value: event.currentTarget.value });
	}}
	placeholder={question.placeholder}
	class="min-h-28 w-full resize-none rounded-sm border border-stone-100 bg-white px-3 py-2.5 text-[0.76rem] leading-[1.15rem] text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-stone-200 md:text-[0.8rem]"
></textarea>
