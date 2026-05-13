<script lang="ts">
	import OnboardingPrimaryButton from '../ui/OnboardingPrimaryButton.svelte';
	import OnboardingStepFrame from '../ui/OnboardingStepFrame.svelte';
	import OnboardingTextarea from '../ui/OnboardingTextarea.svelte';

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
		<input
			bind:value={name}
			placeholder="Partner company's name"
			autocomplete="organization"
			required
			class="box-border h-[42px] w-full rounded-lg border border-[#e2e3e6] bg-white px-3.5 text-sm leading-none text-[#202124] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#8f9297] focus:border-[#6bbdf8] focus:shadow-[0_0_0_1px_#6bbdf8]"
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
