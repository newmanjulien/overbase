<script lang="ts">
	import { ArrowRight } from 'lucide-svelte';

	type Props = {
		title: string;
		description: string;
		label: string;
		value: string;
		buttonLabel: string;
		errorText?: string | null;
		onValueChange: (value: string) => void;
		onContinue: () => void;
	};

	let {
		title,
		description,
		label,
		value,
		buttonLabel,
		errorText = null,
		onValueChange,
		onContinue
	}: Props = $props();

	const canContinue = $derived(value.trim().length > 0);
</script>

<section class="flex min-h-dvh items-center justify-center bg-zinc-50 px-4 py-6">
	<div class="w-full max-w-2xl rounded-sm border border-zinc-200 bg-white p-4 md:p-5">
		<div class="rounded-md border border-zinc-100 bg-zinc-50 px-4 py-4">
			<p class="text-[0.64rem] font-medium uppercase tracking-[0.16em] text-zinc-400">Review</p>
			<h1 class="mt-2.5 text-lg font-semibold tracking-normal text-zinc-950">{title}</h1>
			<p class="mt-1.5 max-w-xl text-[0.8rem] leading-relaxed text-zinc-500">{description}</p>
		</div>

		<div class="mt-4">
			<label for="onboarding-review-text" class="text-[0.72rem] font-medium text-zinc-700">{label}</label>
			<textarea
				id="onboarding-review-text"
				class="mt-1.5 min-h-36 w-full resize-none rounded-sm border border-zinc-200 bg-white px-3 py-2.5 text-[0.8rem] leading-relaxed text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-3 focus:ring-zinc-100"
				value={value}
				oninput={(event) => {
					onValueChange(event.currentTarget.value);
				}}
			></textarea>
		</div>

		{#if errorText}
			<p class="mt-3 text-[0.72rem] font-medium text-red-600">{errorText}</p>
		{/if}

		<div class="mt-4 flex justify-end">
			<button
				type="button"
				disabled={!canContinue}
				class="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-zinc-950 px-4 text-[0.8rem] font-medium text-white transition hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500"
				onclick={onContinue}
			>
				{buttonLabel}
				<ArrowRight class="size-3.5" />
			</button>
		</div>
	</div>
</section>
