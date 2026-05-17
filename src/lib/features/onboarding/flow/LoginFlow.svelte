<script lang="ts">
	import { resolve } from '$app/paths';
	import { useSignIn, useSignUp } from 'svelte-clerk';
	import { buildAuthEntryHref } from './auth-return';
	import OnboardingCodeStep from '../steps/OnboardingCodeStep.svelte';
	import OnboardingLoginStep from '../steps/OnboardingLoginStep.svelte';
	import OnboardingAuthShell from './OnboardingAuthShell.svelte';
	import { createClerkEmailCodeAuthController, getClerkErrorCode } from './clerk-email-code-auth';

	type LoginStep = 'login' | 'code';

	type Props = {
		exitHref?: string;
		entryReturnHref?: string;
	};

	let { exitHref, entryReturnHref }: Props = $props();

	const signUpState = useSignUp();
	const signInState = useSignIn();
	const authController = createClerkEmailCodeAuthController({
		getSignIn: () => signInState.signIn,
		getSignUp: () => signUpState.signUp
	});

	let step = $state<LoginStep>('login');
	let email = $state('');
	let verificationCode = $state('');
	let authErrorText = $state<string | null>(null);
	let isSubmittingEmail = $state(false);
	let isSubmittingCode = $state(false);
	let isResendingCode = $state(false);

	const signupHref = $derived(buildAuthEntryHref('/signup', exitHref, '/login'));
	const currentReturnButtonHref = $derived(step === 'login' ? (entryReturnHref ?? exitHref) : undefined);

	async function submitEmail() {
		const normalizedEmail = email.trim().toLowerCase();
		if (!normalizedEmail || isSubmittingEmail) return;

		isSubmittingEmail = true;
		authErrorText = null;
		verificationCode = '';

		try {
			await authController.sendLoginCode(normalizedEmail);
			email = normalizedEmail;
			step = 'code';
		} catch (error) {
			authErrorText =
				getClerkErrorCode(error) === 'form_identifier_not_found'
					? "Couldn't find your account."
					: authController.getErrorMessage(error);
		} finally {
			isSubmittingEmail = false;
		}
	}

	async function submitCode() {
		const code = verificationCode.trim();
		if (!code || isSubmittingCode) return;

		isSubmittingCode = true;
		authErrorText = null;

		try {
			await authController.verifyCode(code);
		} catch (error) {
			authErrorText = authController.getErrorMessage(error);
		} finally {
			isSubmittingCode = false;
		}
	}

	async function resendCode() {
		if (isResendingCode) return;

		isResendingCode = true;
		authErrorText = null;

		try {
			await authController.resendCode();
		} catch (error) {
			authErrorText = authController.getErrorMessage(error);
		} finally {
			isResendingCode = false;
		}
	}

	function showEmailStep() {
		authErrorText = null;
		step = 'login';
	}
</script>

<OnboardingAuthShell
	onReturnButtonClick={step === 'code' ? showEmailStep : undefined}
	returnButtonHref={currentReturnButtonHref}
	showFooter={step === 'login'}
>
	{#snippet footer()}
		<p class="m-0 text-[13px] leading-5 text-[#8f9297]">
			Need an account?
			<a
				href={resolve(signupHref as '/')}
				class="text-zinc-500 underline underline-offset-2 transition-colors hover:text-[#202124]"
			>
				Sign up
			</a>
		</p>
	{/snippet}

	{#if step === 'login'}
		<OnboardingLoginStep
			bind:email
			errorText={authErrorText}
			isSubmitting={isSubmittingEmail}
			onContinue={() => {
				void submitEmail();
			}}
		/>
	{:else}
		<OnboardingCodeStep
			email={email}
			bind:code={verificationCode}
			errorText={authErrorText}
			isSubmitting={isSubmittingCode}
			isResending={isResendingCode}
			onSubmit={() => void submitCode()}
			onResend={() => void resendCode()}
			onChangeEmail={showEmailStep}
		/>
	{/if}
</OnboardingAuthShell>
