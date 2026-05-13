<script lang="ts">
	import OnboardingPrimaryButton from '../ui/OnboardingPrimaryButton.svelte';
	import OnboardingStepFrame from '../ui/OnboardingStepFrame.svelte';

	type Props = {
		name: string;
		website: string;
		onContinue: () => void;
	};

	let { name = $bindable(), website = $bindable(), onContinue }: Props = $props();
	const canContinue = $derived(name.trim().length > 0 && website.trim().length > 0);
</script>

<OnboardingStepFrame
	title="Tell us about your company"
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
			placeholder="Your company's name"
			autocomplete="organization"
			required
			class="box-border h-[42px] w-full rounded-lg border border-[#e2e3e6] bg-white px-3.5 text-sm leading-none text-[#202124] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#8f9297] focus:border-[#6bbdf8] focus:shadow-[0_0_0_1px_#6bbdf8]"
		/>
		<input
			bind:value={website}
			placeholder="Your company's website"
			autocomplete="url"
			inputmode="url"
			required
			class="box-border h-[42px] w-full rounded-lg border border-[#e2e3e6] bg-white px-3.5 text-sm leading-none text-[#202124] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#8f9297] focus:border-[#6bbdf8] focus:shadow-[0_0_0_1px_#6bbdf8]"
		/>
		<OnboardingPrimaryButton type="submit" disabled={!canContinue}>Last step</OnboardingPrimaryButton>
	</form>
</OnboardingStepFrame>
