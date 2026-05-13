<script lang="ts">
	import OnboardingPrimaryButton from '../ui/OnboardingPrimaryButton.svelte';
	import OnboardingStepFrame from '../ui/OnboardingStepFrame.svelte';
	import OnboardingTextInput from '../ui/OnboardingTextInput.svelte';

	type Props = {
		name: string;
		website: string;
		onContinue: () => void;
	};

	let { name = $bindable(), website = $bindable(), onContinue }: Props = $props();
	const canContinue = $derived(name.trim().length > 0 && website.trim().length > 0);
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
		<OnboardingPrimaryButton type="submit" disabled={!canContinue}>Last step</OnboardingPrimaryButton>
	</form>
</OnboardingStepFrame>
