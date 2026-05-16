<script lang="ts">
	import OnboardingPrimaryButton from '../ui/OnboardingPrimaryButton.svelte';
	import OnboardingStepFrame from '../ui/OnboardingStepFrame.svelte';
	import OnboardingTextTooltip from '../ui/OnboardingTextTooltip.svelte';
	import OnboardingTextInput from '../ui/OnboardingTextInput.svelte';

	type Props = {
		name: string;
		website: string;
		errorText: string | null;
		isSubmitting: boolean;
		onContinue: () => void;
	};

	let {
		name = $bindable(),
		website = $bindable(),
		errorText,
		isSubmitting,
		onContinue
	}: Props = $props();
	const canContinue = $derived(
		name.trim().length > 0 && website.trim().length > 0 && !isSubmitting
	);
</script>

<OnboardingStepFrame
	title="About your company"
>
	<form
		class="grid gap-3.5"
		onsubmit={(event) => {
			event.preventDefault();
			if (canContinue) {
				onContinue();
			}
		}}
	>
		<OnboardingTextInput
			label="Your company's name"
			bind:value={name}
			autocomplete="organization"
			required
			autofocus
		/>
		<OnboardingTextInput
			label="Your company's website"
			bind:value={website}
			type="url"
			autocomplete="url"
			inputmode="url"
			required
		/>
		<OnboardingTextTooltip
			id="onboarding-company-website-tooltip"
			label="Why your website?"
			text="We search for your website then use the information on it to understand your company without you needing to tell us anything"
		/>
		{#if errorText}
			<p class="m-0 text-sm leading-5 text-red-600">{errorText}</p>
		{/if}
		<OnboardingPrimaryButton type="submit" disabled={!canContinue}>
			{isSubmitting ? 'Saving...' : 'Last step'}
		</OnboardingPrimaryButton>
	</form>
</OnboardingStepFrame>
