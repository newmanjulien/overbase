<script lang="ts">
	import type {
		BuilderGuideAnswer,
		BuilderGuideChoiceAnswer
	} from '../guide-answer';
	import type { BuilderGuideChoiceQuestion } from '../guide-types';

	type Props = {
		question: BuilderGuideChoiceQuestion;
		answer: BuilderGuideChoiceAnswer;
		onAnswerChange: (answer: BuilderGuideAnswer) => void;
	};

	let { question, answer, onAnswerChange }: Props = $props();
</script>

<div class="divide-y divide-stone-100">
	{#each question.options as option (option)}
		<label
			class="flex min-h-11 cursor-pointer items-center gap-3 py-2 text-[0.76rem] text-stone-800 md:text-[0.8rem]"
		>
			<input
				type="radio"
				name={question.id}
				value={option}
				checked={answer.selectedOption === option}
				onchange={() => {
					onAnswerChange({ ...answer, selectedOption: option });
				}}
				class="peer sr-only"
			/>
			<span
				class="size-4 rounded-full border border-stone-300 bg-white shadow-[inset_0_0_0_2px_white] peer-checked:border-stone-950 peer-checked:bg-stone-950"
			></span>
			<span>{option}</span>
		</label>
	{/each}
</div>
