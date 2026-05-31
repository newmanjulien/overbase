<script lang="ts">
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import { Button, HelpTooltip, InfoBar, InlineText } from '$lib/ui';
	import { cn } from '$lib/ui/cn';
	import {
		BUILDER_STARTING_POINT_SELECTION_SKIPPED_ANSWER,
		type BuilderStartingPointSelectionAnswers,
		type GuidedStartingPointSelection
	} from '$lib/features/builder/domain';
	import BuilderActionBar from '../layout/BuilderActionBar.svelte';

	type Props = {
		startingPointSelection: GuidedStartingPointSelection;
		onAnswersChange: (answers: BuilderStartingPointSelectionAnswers) => void;
		onSubmit: (answers: BuilderStartingPointSelectionAnswers) => void;
	};

	let { startingPointSelection, onAnswersChange, onSubmit }: Props = $props();
	let currentQuestionIndex = $state(0);
	let selectedAnswers = $state<BuilderStartingPointSelectionAnswers>({});
	const currentQuestion = $derived(startingPointSelection.questions[currentQuestionIndex]);
	const canGoPrevious = $derived(currentQuestionIndex > 0);
	const canGoNext = $derived(currentQuestionIndex < startingPointSelection.questions.length - 1);
	const currentQuestionHasSelectedAnswer = $derived(
		currentQuestion ? Boolean(selectedAnswers[currentQuestion.id]) : false
	);
	const stepLabel = $derived(`${currentQuestionIndex + 1} of ${startingPointSelection.questions.length}`);
	const skipActionLabel = $derived(
		startingPointSelection.questions.length === 1
			? 'Skip'
			: canGoPrevious
				? 'Skip remaining'
				: 'Skip all'
	);
	const primaryActionLabel = $derived(canGoNext ? 'Next' : 'Submit');

	function selectOption(questionId: string, optionId: string) {
		selectedAnswers = {
			...selectedAnswers,
			[questionId]: optionId
		};
		onAnswersChange({ ...selectedAnswers });
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

	function materializeSkippedAnswers(fromQuestionIndex = 0) {
		const answers = { ...selectedAnswers };

		for (let index = fromQuestionIndex; index < startingPointSelection.questions.length; index += 1) {
			const questionId = startingPointSelection.questions[index]?.id;

			if (questionId && !answers[questionId]) {
				answers[questionId] = BUILDER_STARTING_POINT_SELECTION_SKIPPED_ANSWER;
			}
		}

		return answers;
	}

	function submitAnswers() {
		const answers = materializeSkippedAnswers();

		selectedAnswers = answers;
		onAnswersChange({ ...answers });
		onSubmit({ ...answers });
	}

	function skipRemaining() {
		const answers = materializeSkippedAnswers(currentQuestionIndex);

		selectedAnswers = answers;
		onAnswersChange({ ...answers });
		onSubmit({ ...answers });
	}
</script>

<section class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
	<div class="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-7 md:py-8">
		<div class="max-w-3xl">
			<p class="text-[0.79rem] leading-[1.55] text-stone-800">
				{startingPointSelection.intro}
			</p>
		</div>

		{#if currentQuestion}
			<div class="mt-6 rounded-sm border border-stone-100 bg-white p-4 md:mt-8 md:p-6">
				<div class="flex items-start justify-between gap-4">
					<div class="flex min-w-0 items-center gap-1.5">
						<h2 class="min-w-0 text-[0.76rem] font-medium text-stone-950 md:text-[0.8rem]">
							{currentQuestion.title}
						</h2>
						<HelpTooltip
							id={`builder-starting-point-selection-question-help-${currentQuestion.id}`}
							text={currentQuestion.helpText ?? null}
							ariaLabel="Question help"
						/>
					</div>

					{#if startingPointSelection.questions.length > 1}
						<div class="flex shrink-0 items-center gap-1 text-[0.72rem] text-stone-500">
							<button
								type="button"
								aria-label="Previous question"
								class={cn(
									'grid size-5 place-items-center rounded-[6px] disabled:cursor-default disabled:hover:bg-transparent',
									canGoPrevious ? 'text-stone-500 hover:bg-stone-100' : 'text-stone-300'
								)}
								disabled={!canGoPrevious}
								onclick={goPrevious}
							>
								<span class="text-[1rem] leading-none">‹</span>
							</button>
							<span>{stepLabel}</span>
							<button
								type="button"
								aria-label="Next question"
								class={cn(
									'grid size-5 place-items-center rounded-[6px] disabled:cursor-default disabled:hover:bg-transparent',
									canGoNext ? 'text-stone-500 hover:bg-stone-100' : 'text-stone-300'
								)}
								disabled={!canGoNext}
								onclick={goNext}
							>
								<span class="text-[1rem] leading-none">›</span>
							</button>
						</div>
					{/if}
				</div>

				<form
					class="mt-7"
					onsubmit={(event) => {
						event.preventDefault();
					}}
				>
					<fieldset>
						<legend class="sr-only">{currentQuestion.title}</legend>
						<div class="divide-y divide-stone-100">
							{#each currentQuestion.options as option (option.id)}
								<label
									class="flex min-h-11 cursor-pointer items-center gap-3 py-2 text-[0.76rem] text-stone-800 md:text-[0.8rem]"
								>
									<input
										type="radio"
										name={currentQuestion.id}
										value={option.id}
										checked={selectedAnswers[currentQuestion.id] === option.id}
										onchange={() => selectOption(currentQuestion.id, option.id)}
										class="peer sr-only"
									/>
									<span
										class="size-4 rounded-full border border-stone-300 bg-white shadow-[inset_0_0_0_2px_white] peer-checked:border-stone-950 peer-checked:bg-stone-950"
									></span>
									<span>{option.label}</span>
								</label>
							{/each}
						</div>
					</fieldset>
				</form>
			</div>
			{#if startingPointSelection.infoBar}
				<div class="mt-4 max-w-3xl">
					<InfoBar label={startingPointSelection.infoBar.label}>
						<InlineText
							content={startingPointSelection.infoBar.content}
							tooltipIdPrefix={`builder-starting-point-selection-info-${startingPointSelection.infoBar.label}`}
						/>
					</InfoBar>
				</div>
			{/if}
		{/if}
	</div>

	{#if currentQuestion}
		<BuilderActionBar>
			{#snippet secondary()}
				<Button
					variant="secondary"
					class="h-10 w-full border-transparent bg-transparent text-[0.74rem] text-stone-500 hover:bg-stone-50 md:h-8 md:w-auto md:border-stone-200/60 md:bg-white md:px-2.5 md:text-[0.74rem] md:text-stone-900"
					onclick={skipRemaining}
				>
					{skipActionLabel}
				</Button>
			{/snippet}

			{#snippet primary()}
				<Button
					variant="primary"
					class="h-10 w-full gap-2 text-[0.8rem] md:h-8 md:w-auto md:gap-1.5 md:px-2.5 md:text-[0.74rem]"
					disabled={!canGoNext && !currentQuestionHasSelectedAnswer}
					onclick={() => {
						if (canGoNext) {
							goNext();
						} else {
							submitAnswers();
						}
					}}
				>
					<span>{primaryActionLabel}</span>
					{#snippet trailing()}
						{#if canGoNext}
							<ArrowRightIcon size={15} weight="regular" />
						{/if}
					{/snippet}
				</Button>
			{/snippet}
		</BuilderActionBar>
	{/if}
</section>
