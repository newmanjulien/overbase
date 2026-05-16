<script lang="ts">
	import OnboardingPrimaryButton from '../ui/OnboardingPrimaryButton.svelte';
	import OnboardingStepFrame from '../ui/OnboardingStepFrame.svelte';
	import OnboardingTextInput from '../ui/OnboardingTextInput.svelte';

	type Props = {
		email: string;
		code: string;
		errorText: string | null;
		isSubmitting: boolean;
		isResending: boolean;
		onSubmit: () => void;
		onResend: () => void;
		onChangeEmail: () => void;
	};

	let {
		email,
		code = $bindable(),
		errorText,
		isSubmitting,
		isResending,
		onSubmit,
		onResend,
		onChangeEmail
	}: Props = $props();
	const canSubmit = $derived(code.trim().length > 0 && !isSubmitting);
</script>

<OnboardingStepFrame title="Enter your code">
	<form
		class="grid gap-3.5"
		onsubmit={(event) => {
			event.preventDefault();
			if (canSubmit) {
				onSubmit();
			}
		}}
	>
		<p class="m-0 text-sm leading-5 text-[#686b73]">
			We sent a verification code to {email}.
		</p>
		<OnboardingTextInput
			label="Verification code"
			bind:value={code}
			autocomplete="one-time-code"
			inputmode="numeric"
			required
			autofocus
		/>
		{#if errorText}
			<p class="m-0 text-sm leading-5 text-red-600">{errorText}</p>
		{/if}
		<OnboardingPrimaryButton type="submit" disabled={!canSubmit}>
			{isSubmitting ? 'Checking...' : 'Continue'}
		</OnboardingPrimaryButton>
		<div class="flex items-center justify-between gap-3 text-[13px] leading-5">
			<button
				type="button"
				class="text-zinc-500 underline underline-offset-2 transition hover:text-[#202124]"
				onclick={onChangeEmail}
			>
				Change email
			</button>
			<button
				type="button"
				class="text-zinc-500 underline underline-offset-2 transition hover:text-[#202124] disabled:text-zinc-300"
				disabled={isResending}
				onclick={onResend}
			>
				{isResending ? 'Sending...' : 'Resend code'}
			</button>
		</div>
	</form>
</OnboardingStepFrame>
