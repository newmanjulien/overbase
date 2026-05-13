<script lang="ts">
	import OnboardingHotkeyButton from '../ui/OnboardingHotkeyButton.svelte';
	import OnboardingStepFrame from '../ui/OnboardingStepFrame.svelte';

	type Props = {
		onContinue: () => void;
	};

	let { onContinue }: Props = $props();
</script>

<OnboardingStepFrame
	title="Welcome to Overbase"
	description="You connect your company's data. Your partners connect their data. Then Overbase sends revenue opportunities"
	descriptionClass="text-[15px] text-[#4f5359]"
>
	<OnboardingHotkeyButton onclick={onContinue}>Start setup</OnboardingHotkeyButton>
</OnboardingStepFrame>
