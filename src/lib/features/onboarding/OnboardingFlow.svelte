<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { BuilderAppRecord } from '$lib/features/builder/data';
	import OnboardingBlueprintStep from './OnboardingBlueprintStep.svelte';
	import OnboardingCompanyStep from './OnboardingCompanyStep.svelte';
	import OnboardingPatternLayer from './OnboardingPatternLayer.svelte';
	import OnboardingPartnerStep from './OnboardingPartnerStep.svelte';
	import OnboardingQuotePanel from './OnboardingQuotePanel.svelte';
	import OnboardingShell from './OnboardingShell.svelte';
	import OnboardingSignupStep from './OnboardingSignupStep.svelte';
	import OnboardingWelcomeStep from './OnboardingWelcomeStep.svelte';
	import { loadOnboardingBlueprints } from './onboarding-blueprints';
	import type {
		OnboardingCompany,
		OnboardingPartner,
		OnboardingQuote,
		OnboardingStep
	} from './types';

	type Props = {
		onComplete: () => void;
	};

	let { onComplete }: Props = $props();
	let step = $state<OnboardingStep>('welcome');
	let company = $state<OnboardingCompany>({
		name: '',
		website: ''
	});
	let workEmail = $state('');
	let partner = $state<OnboardingPartner>({
		name: '',
		collaboration: ''
	});
	let blueprintApps = $state<BuilderAppRecord[]>([]);
	let isLoadingBlueprints = $state(false);
	let blueprintErrorText = $state<string | null>(null);
	let hasStartedBlueprintLoad = $state(false);
	const welcomeFooterLinks = [
		{ label: 'Terms of Service', href: 'https://overbase.app/legal/terms-of-service' },
		{ label: 'Privacy Policy', href: 'https://overbase.app/legal/dpa' },
		{ label: 'Support', href: 'https://overbase.app/contact' }
	];
	const quote = {
		text: 'Overbase turns business context into a clear path to the notifications worth building first.',
		personName: 'Morgan Reed',
		personTitle: 'VP Revenue, Northstar Labs',
		avatarSrc: '/onboarding-fred.png',
		avatarAlt: 'Morgan Reed'
	} satisfies OnboardingQuote;

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
		await goto(resolve('/builder/[appSlug]?fresh=1', { appSlug }));
		onComplete();
	}

	async function openBuilder() {
		await goto(resolve('/builder'));
		onComplete();
	}

	function returnFromCurrentStep() {
		if (step === 'partner') {
			step = 'company';
			return;
		}

		if (step === 'company') {
			step = 'signup';
			return;
		}

		if (step === 'signup') {
			step = 'welcome';
			return;
		}

		onComplete();
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
	<OnboardingShell
		onReturn={returnFromCurrentStep}
		footerLinks={step === 'welcome' ? welcomeFooterLinks : undefined}
	>
		{#snippet background()}
			<OnboardingPatternLayer />
		{/snippet}

		{#snippet aside()}
			<OnboardingQuotePanel {quote} />
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
				onContinue={() => {
					step = 'company';
				}}
			/>
		{:else if step === 'company'}
			<OnboardingCompanyStep
				bind:name={company.name}
				bind:website={company.website}
				onContinue={() => {
					step = 'partner';
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
	</OnboardingShell>
{/if}
