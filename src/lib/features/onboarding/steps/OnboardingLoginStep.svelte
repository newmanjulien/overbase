<script lang="ts">
	import OnboardingPrimaryButton from '../ui/OnboardingPrimaryButton.svelte';
	import OnboardingStepFrame from '../ui/OnboardingStepFrame.svelte';
	import OnboardingTextInput from '../ui/OnboardingTextInput.svelte';

	type Props = {
		email: string;
		errorText: string | null;
		isSubmitting: boolean;
		onContinue: () => void;
	};

	let { email = $bindable(), errorText, isSubmitting, onContinue }: Props = $props();
	const canContinue = $derived(email.trim().length > 0 && !isSubmitting);
</script>

<OnboardingStepFrame title="Log in to Overbase">
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
			label="Your work email"
			bind:value={email}
			type="email"
			autocomplete="email"
			required
			autofocus
			invalid={Boolean(errorText)}
		/>
		{#if errorText}
			<p class="m-0 text-sm leading-5 text-[#ff3a1e]">{errorText}</p>
		{/if}
		<OnboardingPrimaryButton type="submit" disabled={!canContinue}>
			{isSubmitting ? 'Sending...' : 'Email me a code'}
		</OnboardingPrimaryButton>
	</form>
</OnboardingStepFrame>
