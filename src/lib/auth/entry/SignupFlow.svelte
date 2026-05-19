<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { api } from '$convex/_generated/api';
	import { BUILDER_FRESH_START_ROUTE, builderAppSlugParams } from '$lib/features/builder/paths';
	import type { BuilderAppRecord } from '$lib/features/builder/catalog';
	import { useConvexClient } from 'convex-svelte';
	import { useSignIn, useSignUp } from 'svelte-clerk';
	import AuthButton from './AuthButton.svelte';
	import AuthCodeStep from './AuthCodeStep.svelte';
	import AuthEntryShell from './AuthEntryShell.svelte';
	import SignupBuilderStep from './SignupBuilderStep.svelte';
	import SignupCompanyStep from './SignupCompanyStep.svelte';
	import SignupPartnerStep from './SignupPartnerStep.svelte';
	import SignupWelcomeStep from './SignupWelcomeStep.svelte';
	import AuthStepFrame from './AuthStepFrame.svelte';
	import AuthTextInput from './AuthTextInput.svelte';
	import { buildAuthEntryHref } from './auth-navigation';
	import { createClerkEmailCodeAuthController, getClerkErrorCode } from './email-code-auth';
	import { loadOnboardingBuilders } from './onboarding-builders';

	type SignupStep = 'welcome' | 'signup' | 'code' | 'company' | 'partner' | 'builder';

	type Props = {
		returnTo?: string;
		returnButtonHref?: string;
		entryReturnHref?: string;
		initialStep?: SignupStep;
		isSignedIn?: boolean;
	};

	let {
		returnTo,
		returnButtonHref,
		entryReturnHref,
		initialStep,
		isSignedIn = false
	}: Props = $props();

	const client = useConvexClient();
	const signUpState = useSignUp();
	const signInState = useSignIn();
	const authController = createClerkEmailCodeAuthController({
		getSignIn: () => signInState.signIn,
		getSignUp: () => signUpState.signUp
	});
	const getInitialStep = () => initialStep ?? (isSignedIn ? 'company' : 'welcome');

	let step = $state<SignupStep>(getInitialStep());
	let email = $state('');
	let verificationCode = $state('');
	let authErrorText = $state<string | null>(null);
	let isSubmittingEmail = $state(false);
	let isSubmittingCode = $state(false);
	let isResendingCode = $state(false);
	let company = $state({
		name: '',
		website: ''
	});
	let partner = $state({
		name: '',
		collaboration: ''
	});
	let companyErrorText = $state<string | null>(null);
	let isSavingCompany = $state(false);
	let builderApps = $state<BuilderAppRecord[]>([]);
	let isLoadingBuilders = $state(false);
	let builderErrorText = $state<string | null>(null);
	let hasStartedBuilderLoad = $state(false);
	let completionErrorText = $state<string | null>(null);
	let completingAppSlug = $state<string | null>(null);
	let isOpeningBuilder = $state(false);

	const loginHref = $derived(buildAuthEntryHref('/login', { returnTo, fromAuth: '/signup' }));
	const currentReturnButtonHref = $derived.by(() => {
		if (step === 'welcome') {
			return entryReturnHref ?? returnButtonHref;
		}

		if (step === 'company' && isSignedIn) {
			return returnButtonHref;
		}

		return undefined;
	});
	const currentReturnButtonClick = $derived.by<(() => void) | undefined>(() => {
		if (step === 'signup') {
			return showWelcomeStep;
		}

		if (step === 'code') {
			return showEmailStep;
		}

		if (step === 'company' && !isSignedIn) {
			return showEmailStep;
		}

		if (step === 'partner') {
			return showCompanyStep;
		}

		return undefined;
	});
	const canContinue = $derived(email.trim().length > 0 && !isSubmittingEmail);
	const isCompletingOnboarding = $derived(Boolean(completingAppSlug) || isOpeningBuilder);

	async function submitEmail() {
		const normalizedEmail = email.trim().toLowerCase();
		if (!normalizedEmail || isSubmittingEmail) return;

		isSubmittingEmail = true;
		authErrorText = null;
		verificationCode = '';

		try {
			await authController.sendSignupCode(normalizedEmail);
			email = normalizedEmail;
			step = 'code';
		} catch (error) {
			authErrorText =
				getClerkErrorCode(error) === 'form_identifier_exists'
					? 'An account already exists for that email.'
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

	async function saveCompany() {
		if (isSavingCompany) return;

		isSavingCompany = true;
		companyErrorText = null;

		try {
			await client.mutation(api.auth.saveOnboardingCompany, {
				companyName: company.name,
				companyWebsite: company.website
			});
			step = 'partner';
		} catch (error) {
			companyErrorText = authController.getErrorMessage(error);
		} finally {
			isSavingCompany = false;
		}
	}

	async function loadBuilders() {
		hasStartedBuilderLoad = true;
		isLoadingBuilders = true;
		builderErrorText = null;

		try {
			builderApps = await loadOnboardingBuilders();
		} catch (error) {
			builderErrorText = error instanceof Error ? error.message : 'Unable to load builders.';
			builderApps = [];
		} finally {
			isLoadingBuilders = false;
		}
	}

	async function selectBuilder(appSlug: string) {
		if (isCompletingOnboarding) return;

		completionErrorText = null;
		completingAppSlug = appSlug;

		try {
			await client.mutation(api.auth.markOnboardingComplete, {});
			await goto(resolve(BUILDER_FRESH_START_ROUTE, builderAppSlugParams(appSlug)));
		} catch (error) {
			completionErrorText = authController.getErrorMessage(error);
		} finally {
			completingAppSlug = null;
		}
	}

	async function openBuilder() {
		if (isCompletingOnboarding) return;

		completionErrorText = null;
		isOpeningBuilder = true;

		try {
			await client.mutation(api.auth.markOnboardingComplete, {});
			await goto(resolve('/builders'));
		} catch (error) {
			completionErrorText = authController.getErrorMessage(error);
		} finally {
			isOpeningBuilder = false;
		}
	}

	function showEmailStep() {
		authErrorText = null;
		step = 'signup';
	}

	function showWelcomeStep() {
		authErrorText = null;
		step = 'welcome';
	}

	function showCompanyStep() {
		companyErrorText = null;
		step = 'company';
	}

	$effect(() => {
		if (step === 'builder' && !hasStartedBuilderLoad) {
			void loadBuilders();
		}
	});
</script>

{#if step === 'builder'}
	<SignupBuilderStep
		apps={builderApps}
		isLoading={isLoadingBuilders}
		errorText={builderErrorText}
		completionErrorText={completionErrorText}
		selectedAppSlug={completingAppSlug}
		isOpeningBuilder={isOpeningBuilder}
		onSelect={(appSlug) => {
			void selectBuilder(appSlug);
		}}
		onOpenBuilder={() => {
			void openBuilder();
		}}
		onRetry={() => {
			void loadBuilders();
		}}
	/>
{:else}
	<AuthEntryShell
		onReturnButtonClick={currentReturnButtonClick}
		returnButtonHref={currentReturnButtonHref}
		showFooter={step === 'signup'}
	>
		{#snippet footer()}
			<p class="m-0 text-[13px] leading-5 text-[#8f9297]">
				Already have an account?
				<a
					href={resolve(loginHref as '/')}
					class="text-zinc-500 underline underline-offset-2 transition-colors hover:text-[#202124]"
				>
					Log in
				</a>
			</p>
		{/snippet}

		{#if step === 'welcome'}
			<SignupWelcomeStep
				onContinue={() => {
					step = 'signup';
				}}
			/>
		{:else if step === 'signup'}
			<AuthStepFrame title="What's your email?">
				<form
					class="grid gap-3.5"
					onsubmit={(event) => {
						event.preventDefault();
						if (canContinue) {
							void submitEmail();
						}
					}}
				>
					<AuthTextInput
						label="Your work email"
						bind:value={email}
						type="email"
						autocomplete="email"
						required
						autofocus
						invalid={Boolean(authErrorText)}
					/>
					{#if authErrorText}
						<p class="m-0 text-sm leading-5 text-[#ff3a1e]">{authErrorText}</p>
					{/if}
					<AuthButton type="submit" disabled={!canContinue}>
						{isSubmittingEmail ? 'Sending...' : 'Email me a code'}
					</AuthButton>
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
			</AuthStepFrame>
		{:else if step === 'code'}
			<AuthCodeStep
				email={email}
				bind:code={verificationCode}
				errorText={authErrorText}
				isSubmitting={isSubmittingCode}
				isResending={isResendingCode}
				onSubmit={() => void submitCode()}
				onResend={() => void resendCode()}
				onChangeEmail={showEmailStep}
			/>
		{:else if step === 'company'}
			<SignupCompanyStep
				bind:name={company.name}
				bind:website={company.website}
				errorText={companyErrorText}
				isSubmitting={isSavingCompany}
				onContinue={() => {
					void saveCompany();
				}}
			/>
		{:else if step === 'partner'}
			<SignupPartnerStep
				bind:name={partner.name}
				bind:collaboration={partner.collaboration}
				onContinue={() => {
					step = 'builder';
				}}
			/>
		{/if}
	</AuthEntryShell>
{/if}
