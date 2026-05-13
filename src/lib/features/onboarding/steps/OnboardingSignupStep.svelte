<script lang="ts">
	import OnboardingPrimaryButton from '../ui/OnboardingPrimaryButton.svelte';
	import OnboardingStepFrame from '../ui/OnboardingStepFrame.svelte';
	import OnboardingTextInput from '../ui/OnboardingTextInput.svelte';

	type Props = {
		email: string;
		onContinue: () => void;
	};

	let { email = $bindable(), onContinue }: Props = $props();
	const canContinue = $derived(email.trim().length > 0);
</script>

<OnboardingStepFrame title="Create your account">
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
		/>
		<OnboardingPrimaryButton type="submit" disabled={!canContinue}>Sign up</OnboardingPrimaryButton>
	</form>
</OnboardingStepFrame>
