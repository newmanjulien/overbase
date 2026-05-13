<script lang="ts">
	import OnboardingHotkeyButton from './OnboardingHotkeyButton.svelte';
	import OnboardingStepFrame from './OnboardingStepFrame.svelte';

	type Props = {
		onContinue: () => void;
	};

	let { onContinue }: Props = $props();
</script>

<OnboardingStepFrame
	title="Welcome to Overbase"
	description="We make it easy to share sales data with your ecosystem partners. You connect your business' data and your partners connect their data. Then Overbase sends revenue opportunities that we find by analyzing both together"
	descriptionClass="text-[15px] text-[#4f5359]"
>
	<OnboardingHotkeyButton onclick={onContinue}>Start setup</OnboardingHotkeyButton>
</OnboardingStepFrame>
