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

<OnboardingStepFrame title="What's your email?">
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
		<p class="m-0 text-center text-[13px] leading-5 text-[#8f9297]">
			By continuing, you accept the
			<a
				href="https://overbase.app/legal/terms-of-service"
				class="text-zinc-500 underline underline-offset-2 transition-colors hover:text-[#202124]"
				target="_blank"
				rel="external noopener noreferrer"
			>
				Terms of Service
			</a>
			and
			<a
				href="https://overbase.app/legal/dpa"
				class="text-zinc-500 underline underline-offset-2 transition-colors hover:text-[#202124]"
				target="_blank"
				rel="external noopener noreferrer"
			>
				Privacy Policy
			</a>
		</p>
	</form>
</OnboardingStepFrame>
