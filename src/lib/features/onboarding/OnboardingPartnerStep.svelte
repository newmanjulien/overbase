<script lang="ts">
	import OnboardingPrimaryButton from './OnboardingPrimaryButton.svelte';
	import OnboardingStepFrame from './OnboardingStepFrame.svelte';
	import OnboardingTextInput from './OnboardingTextInput.svelte';
	import OnboardingTextarea from './OnboardingTextarea.svelte';

	type Props = {
		name: string;
		collaboration: string;
		onContinue: () => void;
	};

	let { name = $bindable(), collaboration = $bindable(), onContinue }: Props = $props();
	const canContinue = $derived(name.trim().length > 0 && collaboration.trim().length > 0);
</script>

<OnboardingStepFrame
	title="Tell us about one of your ecosystem partners"
	description="Tell us about one of the ecosystem partners you currently work with closely"
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
			label="Partner company's name"
			bind:value={name}
			autocomplete="organization"
			required
			autofocus
		/>
		<OnboardingTextarea
			label="How do you collaborate today to get more growth together?"
			bind:value={collaboration}
			required
			submitOnEnter
		/>
		<OnboardingPrimaryButton type="submit" disabled={!canContinue}>Done</OnboardingPrimaryButton>
	</form>
</OnboardingStepFrame>
