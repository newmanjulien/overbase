<script lang="ts">
	import { goto, preloadData } from '$app/navigation';
	import { api } from '$convex/_generated/api';
	import {
		APP_LINKS,
		AUTH_LINKS,
		freshBuilderHref,
		resolveAppHref,
		resolveAuthHref,
		type AppHref,
		type AuthEntryHref
	} from '$lib/app/app-links';
	import type { BuilderCatalogRecord } from '$lib/features/builder/catalog';
	import { useConvexClient } from 'convex-svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { useSignIn, useSignUp } from 'svelte-clerk';
	import AuthButton from '$lib/auth/components/AuthButton.svelte';
	import AuthCodeStep from '$lib/auth/components/AuthCodeStep.svelte';
	import AuthEntryShell from '$lib/auth/components/AuthEntryShell.svelte';
	import AuthStepFrame from '$lib/auth/components/AuthStepFrame.svelte';
	import AuthTextInput from '$lib/auth/components/AuthTextInput.svelte';
	import { createClerkEmailCodeAuthController, getClerkErrorCode } from '$lib/auth/email-code-auth';
	import { buildAuthEntryHref } from '$lib/auth/navigation';
	import JoinBuilderStep from './JoinBuilderStep.svelte';
	import JoinCompanyStep from './JoinCompanyStep.svelte';
	import JoinPartnerStep from './JoinPartnerStep.svelte';
	import JoinWelcomeStep from './JoinWelcomeStep.svelte';
	import { loadOnboardingBuilders } from './onboarding-builders';

	type JoinStep = 'welcome' | 'join' | 'code' | 'company' | 'partner' | 'builder';

	type Props = {
		returnTo?: AppHref;
		returnButtonHref?: string;
		entryReturnHref?: AuthEntryHref;
		initialStep?: JoinStep;
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

	let step = $state<JoinStep>(getInitialStep());
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
	let builderApps = $state<BuilderCatalogRecord[]>([]);
	let isLoadingBuilders = $state(false);
	let builderErrorText = $state<string | null>(null);
	let hasStartedBuilderLoad = $state(false);
	let completionErrorText = $state<string | null>(null);
	let completingAppSlug = $state<string | null>(null);
	let isOpeningBuilder = $state(false);
	let builderHomePreloadPromise: Promise<void> | null = null;
	let builderLoadPromise: Promise<void> | null = null;
	const builderRoutePreloadPromises = new SvelteMap<string, Promise<void>>();

	const loginHref = $derived(
		buildAuthEntryHref(AUTH_LINKS.login.pathname, {
			returnTo,
			fromAuth: AUTH_LINKS.join.pathname
		})
	);
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
		if (step === 'join') {
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
			await authController.sendJoinCode(normalizedEmail);
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

	function preloadBuildersHome() {
		if (builderHomePreloadPromise) {
			return builderHomePreloadPromise;
		}

		builderHomePreloadPromise = preloadData(resolveAppHref(APP_LINKS.builders.pathname)).then(
			() => undefined,
			() => undefined
		);

		return builderHomePreloadPromise;
	}

	function preloadBuilderRoute(appSlug: string) {
		const existingPreload = builderRoutePreloadPromises.get(appSlug);

		if (existingPreload) {
			return existingPreload;
		}

		const routePreload = preloadBuildersHome()
			.then(() => preloadData(freshBuilderHref(appSlug)))
			.then(
				() => undefined,
				() => undefined
			);

		builderRoutePreloadPromises.set(appSlug, routePreload);

		return routePreload;
	}

	function preloadOnboardingBuilders() {
		return loadBuilders();
	}

	async function loadBuilders() {
		if (builderLoadPromise) {
			return builderLoadPromise;
		}

		hasStartedBuilderLoad = true;
		isLoadingBuilders = true;
		builderErrorText = null;

		builderLoadPromise = (async () => {
			try {
				builderApps = await loadOnboardingBuilders();
			} catch (error) {
				builderErrorText = error instanceof Error ? error.message : 'Unable to load builders.';
				builderApps = [];
			} finally {
				isLoadingBuilders = false;
				builderLoadPromise = null;
			}
		})();

		return builderLoadPromise;
	}

	async function selectBuilder(appSlug: string) {
		if (isCompletingOnboarding) return;

		completionErrorText = null;
		completingAppSlug = appSlug;

		try {
			await client.mutation(api.auth.markOnboardingComplete, {});
			await goto(freshBuilderHref(appSlug));
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
			await goto(resolveAppHref(APP_LINKS.builders.pathname));
		} catch (error) {
			completionErrorText = authController.getErrorMessage(error);
		} finally {
			isOpeningBuilder = false;
		}
	}

	function showEmailStep() {
		authErrorText = null;
		step = 'join';
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
			void preloadOnboardingBuilders();
		}

		if (step === 'partner') {
			void preloadBuildersHome();
			void preloadOnboardingBuilders();
		}
	});
</script>

{#if step === 'builder'}
	<JoinBuilderStep
		apps={builderApps}
		isLoading={isLoadingBuilders}
		errorText={builderErrorText}
		completionErrorText={completionErrorText}
		selectedAppSlug={completingAppSlug}
		isOpeningBuilder={isOpeningBuilder}
		onSelect={(appSlug) => {
			void selectBuilder(appSlug);
		}}
		onPreload={(appSlug) => {
			void preloadBuilderRoute(appSlug);
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
		showFooter={step === 'join'}
	>
		{#snippet footer()}
			<p class="m-0 text-[13px] leading-5 text-[#8f9297]">
				Already have an account?
				<a
					href={resolveAuthHref(loginHref)}
					class="text-stone-500 underline underline-offset-2 transition-colors hover:text-[#202124]"
				>
					Log in
				</a>
			</p>
		{/snippet}

		{#if step === 'welcome'}
			<JoinWelcomeStep
				onContinue={() => {
					step = 'join';
				}}
			/>
		{:else if step === 'join'}
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
							class="text-stone-500 underline underline-offset-2 transition-colors hover:text-[#202124]"
							target="_blank"
							rel="external noopener noreferrer"
						>
							Terms of Service
						</a>
						and
						<a
							href="https://overbase.app/legal/dpa"
							class="text-stone-500 underline underline-offset-2 transition-colors hover:text-[#202124]"
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
			<JoinCompanyStep
				bind:name={company.name}
				bind:website={company.website}
				errorText={companyErrorText}
				isSubmitting={isSavingCompany}
				onContinue={() => {
					void saveCompany();
				}}
			/>
		{:else if step === 'partner'}
			<JoinPartnerStep
				bind:name={partner.name}
				bind:collaboration={partner.collaboration}
				onContinue={() => {
					step = 'builder';
				}}
			/>
		{/if}
	</AuthEntryShell>
{/if}
