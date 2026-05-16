<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { api } from '$convex/_generated/api';
	import { useConvexClient } from 'convex-svelte';
	import { useClerkContext, useSignIn, useSignUp } from 'svelte-clerk';
	import type { BuilderAppRecord } from '$lib/features/builder/catalog';
	import { BUILDER_FRESH_START_ROUTE, builderAppSlugParams } from '$lib/features/builder/paths';
	import { buildAuthEntryHref } from './auth-return';
	import OnboardingBlueprintStep from '../steps/OnboardingBlueprintStep.svelte';
	import OnboardingCodeStep from '../steps/OnboardingCodeStep.svelte';
	import OnboardingCompanyStep from '../steps/OnboardingCompanyStep.svelte';
	import OnboardingPartnerStep from '../steps/OnboardingPartnerStep.svelte';
	import OnboardingSignupStep from '../steps/OnboardingSignupStep.svelte';
	import OnboardingWelcomeStep from '../steps/OnboardingWelcomeStep.svelte';
	import OnboardingAuthShell from './OnboardingAuthShell.svelte';
	import { createClerkEmailCodeAuthController, getClerkErrorCode } from './clerk-email-code-auth';
	import { loadOnboardingBlueprints } from './onboarding-blueprints';
	import type { OnboardingCompany, OnboardingPartner, OnboardingStep } from './types';

	type Props = {
		initialStep?: OnboardingStep;
		marketingReturnHref?: string;
	};

	let { initialStep = 'welcome', marketingReturnHref }: Props = $props();
	const client = useConvexClient();
	const clerk = useClerkContext();
	const signUpState = useSignUp();
	const signInState = useSignIn();
	const authController = createClerkEmailCodeAuthController({
		getSignIn: () => signInState.signIn,
		getSignUp: () => signUpState.signUp
	});
	const getInitialStep = () => initialStep;
	let step = $state<OnboardingStep>(getInitialStep());
	let company = $state<OnboardingCompany>({
		name: '',
		website: ''
	});
	let workEmail = $state('');
	let verificationCode = $state('');
	let authErrorText = $state<string | null>(null);
	let isSubmittingEmail = $state(false);
	let isSubmittingCode = $state(false);
	let isResendingCode = $state(false);
	let partner = $state<OnboardingPartner>({
		name: '',
		collaboration: ''
	});
	let blueprintApps = $state<BuilderAppRecord[]>([]);
	let isLoadingBlueprints = $state(false);
	let blueprintErrorText = $state<string | null>(null);
	let hasStartedBlueprintLoad = $state(false);
	let companyErrorText = $state<string | null>(null);
	let isSavingCompany = $state(false);
	let completionErrorText = $state<string | null>(null);
	let completingAppSlug = $state<string | null>(null);
	let isOpeningBuilder = $state(false);
	const isCompletingOnboarding = $derived(Boolean(completingAppSlug) || isOpeningBuilder);
	const hasFooter = $derived(step === 'welcome' || step === 'signup');
	const footerBorder = $derived(step === 'welcome' || step === 'signup');
	const canReturn = $derived(
		step === 'signup' || step === 'code' || step === 'partner' || (!clerk.auth.userId && step === 'company')
	);
	const currentReturnHref = $derived(step === 'welcome' ? marketingReturnHref : undefined);
	const loginHref = $derived(buildAuthEntryHref('/login', marketingReturnHref));
	const welcomeFooterLinks = [
		{ label: 'Terms of Service', href: 'https://overbase.app/legal/terms-of-service' },
		{ label: 'Privacy Policy', href: 'https://overbase.app/legal/dpa' },
		{ label: 'Support', href: 'https://overbase.app/contact' }
	];

	async function loadBlueprints() {
		hasStartedBlueprintLoad = true;
		isLoadingBlueprints = true;
		blueprintErrorText = null;

		try {
			blueprintApps = await loadOnboardingBlueprints();
		} catch (error) {
			blueprintErrorText = error instanceof Error ? error.message : 'Unable to load blueprints.';
			blueprintApps = [];
		} finally {
			isLoadingBlueprints = false;
		}
	}

	async function selectBlueprint(appSlug: string) {
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
			await goto(resolve('/builder'));
		} catch (error) {
			completionErrorText = authController.getErrorMessage(error);
		} finally {
			isOpeningBuilder = false;
		}
	}

	async function submitEmail() {
		const email = workEmail.trim().toLowerCase();
		if (!email || isSubmittingEmail) return;

		isSubmittingEmail = true;
		authErrorText = null;
		verificationCode = '';

		try {
			await authController.sendSignupCode(email);
			workEmail = email;
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

	function returnFromCurrentStep() {
		if (step === 'partner') {
			step = 'company';
			return;
		}

		if (step === 'company') {
			if (!clerk.auth.userId) {
				step = 'signup';
			}
			return;
		}

		if (step === 'code') {
			step = 'signup';
			return;
		}

		if (step === 'signup') {
			step = 'welcome';
			return;
		}

		return;
	}

	$effect(() => {
		if (step === 'partner' && !hasStartedBlueprintLoad) {
			void loadBlueprints();
		}
	});

</script>

{#if step === 'blueprint'}
	<OnboardingBlueprintStep
		apps={blueprintApps}
		isLoading={isLoadingBlueprints}
		errorText={blueprintErrorText}
		completionErrorText={completionErrorText}
		selectedAppSlug={completingAppSlug}
		isOpeningBuilder={isOpeningBuilder}
		onSelect={(appSlug) => {
			void selectBlueprint(appSlug);
		}}
		onOpenBuilder={() => {
			void openBuilder();
		}}
		onRetry={() => {
			void loadBlueprints();
		}}
	/>
{:else}
	<OnboardingAuthShell
		onReturn={canReturn ? returnFromCurrentStep : undefined}
		returnHref={currentReturnHref}
		showFooter={hasFooter}
		footerBorder={footerBorder}
	>
		{#snippet footer()}
			{#if step === 'welcome'}
				<nav class="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] leading-5 text-[#8f9297]">
					{#each welcomeFooterLinks as link (link.href)}
						<a class="transition-colors hover:text-[#202124]" href={link.href} rel="external">
							{link.label}
						</a>
					{/each}
				</nav>
			{:else if step === 'signup'}
				<p class="m-0 text-[13px] leading-5 text-[#8f9297]">
					Already have an account?
					<a
						href={loginHref}
						class="text-zinc-500 underline underline-offset-2 transition-colors hover:text-[#202124]"
					>
						Log in
					</a>
				</p>
			{/if}
		{/snippet}

		{#if step === 'welcome'}
			<OnboardingWelcomeStep
				onContinue={() => {
					step = 'signup';
				}}
			/>
		{:else if step === 'signup'}
			<OnboardingSignupStep
				bind:email={workEmail}
				errorText={authErrorText}
				isSubmitting={isSubmittingEmail}
				onContinue={() => {
					void submitEmail();
				}}
			/>
		{:else if step === 'code'}
			<OnboardingCodeStep
				email={workEmail}
				bind:code={verificationCode}
				errorText={authErrorText}
				isSubmitting={isSubmittingCode}
				isResending={isResendingCode}
				onSubmit={() => void submitCode()}
				onResend={() => void resendCode()}
				onChangeEmail={() => {
					authErrorText = null;
					step = 'signup';
				}}
			/>
		{:else if step === 'company'}
			<OnboardingCompanyStep
				bind:name={company.name}
				bind:website={company.website}
				errorText={companyErrorText}
				isSubmitting={isSavingCompany}
				onContinue={() => {
					void saveCompany();
				}}
			/>
		{:else if step === 'partner'}
			<OnboardingPartnerStep
				bind:name={partner.name}
				bind:collaboration={partner.collaboration}
				onContinue={() => {
					step = 'blueprint';
				}}
			/>
		{/if}
	</OnboardingAuthShell>
{/if}
