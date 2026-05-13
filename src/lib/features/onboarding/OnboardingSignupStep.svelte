<script lang="ts">
	import OnboardingPrimaryButton from './OnboardingPrimaryButton.svelte';
	import OnboardingStepFrame from './OnboardingStepFrame.svelte';

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
		<input
			bind:value={email}
			placeholder="Your work email"
			type="email"
			autocomplete="email"
			required
			class="box-border h-[42px] w-full rounded-lg border border-[#e2e3e6] bg-white px-3.5 text-sm leading-none text-[#202124] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#8f9297] focus:border-[#6bbdf8] focus:shadow-[0_0_0_1px_#6bbdf8]"
		/>
		<OnboardingPrimaryButton type="submit" disabled={!canContinue}>Sign up</OnboardingPrimaryButton>
		<p class="m-0 text-center text-sm leading-5 text-[#777b82]">
			Already have an account?
			<a
				href="https://overbase.app/login"
				class="cursor-pointer border-0 bg-transparent p-0 text-sm font-medium leading-5 text-[#1296f7] outline-none transition-colors hover:text-[#0d8eea] focus-visible:rounded-sm focus-visible:shadow-[0_0_0_3px_rgb(18_150_247_/_22%)]"
			>
				Log in
			</a>
		</p>
	</form>
</OnboardingStepFrame>
