<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		ArrowRight,
		BarChart3,
		BriefcaseBusiness,
		Check,
		Flag,
		Handshake,
		Network,
		Sparkles,
		Target,
		UsersRound,
		Zap
	} from 'lucide-svelte';
	import { cn } from '$lib/components/chrome/shared/cn';
	import OnboardingLoadingScreen from './OnboardingLoadingScreen.svelte';
	import OnboardingReviewScreen from './OnboardingReviewScreen.svelte';
	import type { OnboardingBlueprintRecommendation, OnboardingStep } from './types';

	type Props = {
		onComplete: () => void;
	};

	type JsonObject = Record<string, unknown>;
	type ArtworkIcon = typeof Flag;

	let { onComplete }: Props = $props();

	let step = $state<OnboardingStep>('businessForm');
	let businessName = $state('');
	let website = $state('');
	let businessDescription = $state('');
	let goToMarketDescription = $state('');
	let recommendations = $state<OnboardingBlueprintRecommendation[]>([]);
	let errorText = $state<string | null>(null);

	const canSubmitBusiness = $derived(businessName.trim().length > 0 && website.trim().length > 0);

	const artworkIcons: Record<string, ArtworkIcon> = {
		'bar-chart-3': BarChart3,
		'briefcase-business': BriefcaseBusiness,
		flag: Flag,
		handshake: Handshake,
		network: Network,
		sparkles: Sparkles,
		target: Target,
		'users-round': UsersRound,
		zap: Zap
	};

	const cardToneClass = {
		coral: 'bg-[#f47464]',
		violet: 'bg-[#a64df0]',
		aqua: 'bg-[#8bddeb]',
		zinc: 'bg-zinc-200'
	} as const;

	function isRecord(value: unknown): value is JsonObject {
		return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
	}

	async function postJson(path: string, body: JsonObject) {
		const response = await fetch(path, {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify(body)
		});
		const data = (await response.json()) as unknown;

		if (!response.ok) {
			const message = isRecord(data) && typeof data.message === 'string' ? data.message : null;
			throw new Error(message ?? 'Onboarding request failed.');
		}

		if (!isRecord(data)) {
			throw new Error('Onboarding returned an invalid response.');
		}

		return data;
	}

	function readString(data: JsonObject, field: string) {
		const value = data[field];

		if (typeof value !== 'string' || !value.trim()) {
			throw new Error('Onboarding returned an invalid response.');
		}

		return value.trim();
	}

	function isRecommendation(value: unknown): value is OnboardingBlueprintRecommendation {
		return (
			isRecord(value) &&
			typeof value.appSlug === 'string' &&
			typeof value.title === 'string' &&
			typeof value.description === 'string' &&
			typeof value.reason === 'string' &&
			isRecord(value.artwork) &&
			isRecord(value.artwork.card) &&
			typeof value.artwork.id === 'string' &&
			(value.artwork.card.tone === 'coral' ||
				value.artwork.card.tone === 'violet' ||
				value.artwork.card.tone === 'aqua' ||
				value.artwork.card.tone === 'zinc') &&
			typeof value.artwork.card.iconId === 'string' &&
			(value.artwork.card.symbolSize === 'sm' || value.artwork.card.symbolSize === 'md')
		);
	}

	function readRecommendations(data: JsonObject) {
		const value = data.blueprints;

		if (!Array.isArray(value) || !value.every(isRecommendation)) {
			throw new Error('Onboarding returned invalid blueprint recommendations.');
		}

		return value;
	}

	async function submitBusiness() {
		if (!canSubmitBusiness) {
			return;
		}

		errorText = null;
		step = 'researchingBusiness';

		try {
			const data = await postJson('/api/onboarding/business-description', {
				businessName,
				website
			});
			businessDescription = readString(data, 'businessDescription');
			step = 'reviewBusiness';
		} catch (error) {
			errorText = error instanceof Error ? error.message : 'Unable to research this business.';
			step = 'businessForm';
		}
	}

	async function submitBusinessDescription() {
		if (!businessDescription.trim()) {
			return;
		}

		errorText = null;
		step = 'researchingGoToMarket';

		try {
			const data = await postJson('/api/onboarding/go-to-market', {
				businessName,
				website,
				businessDescription
			});
			goToMarketDescription = readString(data, 'goToMarketDescription');
			step = 'reviewGoToMarket';
		} catch (error) {
			errorText = error instanceof Error ? error.message : 'Unable to research go-to-market.';
			step = 'reviewBusiness';
		}
	}

	async function submitGoToMarketDescription() {
		if (!goToMarketDescription.trim()) {
			return;
		}

		errorText = null;
		step = 'recommendingBlueprints';

		try {
			const data = await postJson('/api/onboarding/blueprints', {
				businessDescription,
				goToMarketDescription
			});
			recommendations = readRecommendations(data);
			step = 'blueprintRecommendations';
		} catch (error) {
			errorText = error instanceof Error ? error.message : 'Unable to recommend blueprints.';
			step = 'reviewGoToMarket';
		}
	}

	async function selectBlueprint(blueprint: OnboardingBlueprintRecommendation) {
		onComplete();
		await goto(resolve('/builder/[appSlug]?fresh=1', { appSlug: blueprint.appSlug }));
	}

	async function openBuilderGallery() {
		onComplete();
		await goto(resolve('/builder'));
	}

	function getArtworkIcon(iconId: string) {
		return artworkIcons[iconId] ?? Flag;
	}
</script>

{#if step === 'businessForm'}
	<section class="min-h-dvh bg-zinc-50 px-3 py-4 md:px-5 md:py-5">
		<div class="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-5xl items-center">
			<div class="grid w-full gap-3 lg:grid-cols-[1.08fr_0.92fr]">
				<div
					class="relative overflow-hidden rounded-sm border border-zinc-200 bg-white p-3 md:p-4"
				>
					<div class="grid min-h-[23rem] grid-rows-[1fr_auto] gap-3">
						<div class="grid grid-cols-[0.86fr_1.14fr] gap-3">
							<div class="flex flex-col gap-3">
								<div class="rounded-sm border border-zinc-200 bg-[#f47464] p-3 text-white">
									<div class="flex size-8 items-center justify-center rounded-full bg-white/90 text-zinc-950">
										<BriefcaseBusiness class="size-4" />
									</div>
									<p class="mt-9 text-[0.66rem] font-medium uppercase tracking-[0.14em] text-white/75">
										Company
									</p>
									<p class="mt-1.5 text-base font-semibold tracking-normal">Profile</p>
								</div>

								<div class="flex-1 rounded-sm border border-zinc-200 bg-zinc-950 p-3 text-white">
									<Network class="size-5 text-[#8bddeb]" />
									<div class="mt-12 space-y-1.5">
										<div class="h-1.5 w-4/5 rounded-full bg-white/80"></div>
										<div class="h-1.5 w-2/3 rounded-full bg-white/35"></div>
										<div class="h-1.5 w-1/2 rounded-full bg-white/20"></div>
									</div>
								</div>
							</div>

							<div class="flex flex-col gap-3">
								<div class="rounded-sm border border-zinc-200 bg-[#8bddeb] p-3">
									<div class="flex items-start justify-between gap-3">
										<div>
											<p class="text-[0.64rem] font-medium uppercase tracking-[0.14em] text-zinc-700">
												Signals
											</p>
											<p class="mt-1.5 text-lg font-semibold tracking-normal text-zinc-950">
												Go-to-market
											</p>
										</div>
										<Target class="size-5 text-zinc-950" />
									</div>
									<div class="mt-10 grid grid-cols-3 gap-1.5">
										<div class="h-11 rounded-sm bg-white/70"></div>
										<div class="h-11 rounded-sm bg-white/45"></div>
										<div class="h-11 rounded-sm bg-white/70"></div>
									</div>
								</div>

								<div class="grid flex-1 grid-cols-2 gap-3">
									<div class="rounded-sm border border-zinc-200 bg-[#a64df0] p-3 text-white">
										<Sparkles class="size-5" />
										<p class="mt-12 text-xs font-medium leading-snug">Blueprint match</p>
									</div>
									<div class="rounded-sm border border-zinc-200 bg-white p-3">
										<Handshake class="size-5 text-zinc-950" />
										<div class="mt-12 flex items-center gap-1.5 text-[0.7rem] font-medium text-zinc-600">
											<Check class="size-3.5 text-zinc-950" />
											Ready
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="rounded-sm border border-zinc-200 bg-zinc-50 p-3">
							<p class="text-[0.64rem] font-medium uppercase tracking-[0.16em] text-zinc-400">
								Overbase
							</p>
							<p class="mt-1.5 max-w-lg text-base font-semibold tracking-normal text-zinc-950">
								Find the right notification blueprint for your team.
							</p>
						</div>
					</div>
				</div>

				<form
					class="flex min-h-[23rem] flex-col justify-center rounded-sm border border-zinc-200 bg-white p-4 md:p-6"
					onsubmit={(event) => {
						event.preventDefault();
						void submitBusiness();
					}}
				>
					<p class="text-[0.64rem] font-medium uppercase tracking-[0.16em] text-zinc-400">
						Welcome to Overbase
					</p>
					<h1 class="mt-3 text-2xl font-semibold tracking-normal text-zinc-950">
						Tell us about the business.
					</h1>
					<p class="mt-2.5 text-[0.8rem] leading-relaxed text-zinc-500">
						Overbase will use this to research the company, understand the sales motion, and
						recommend a notification blueprint.
					</p>

					<div class="mt-6 space-y-3.5">
						<div>
							<label for="business-name" class="text-[0.72rem] font-medium text-zinc-700">
								Business name
							</label>
							<input
								id="business-name"
								autocomplete="organization"
								class="mt-1.5 h-9 w-full rounded-sm border border-zinc-200 bg-white px-2.5 text-[0.8rem] text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-3 focus:ring-zinc-100"
								placeholder="Acme Advisory"
								bind:value={businessName}
							/>
						</div>

						<div>
							<label for="business-website" class="text-[0.72rem] font-medium text-zinc-700">
								Company website
							</label>
							<input
								id="business-website"
								autocomplete="url"
								class="mt-1.5 h-9 w-full rounded-sm border border-zinc-200 bg-white px-2.5 text-[0.8rem] text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-3 focus:ring-zinc-100"
								placeholder="https://example.com"
								bind:value={website}
							/>
						</div>
					</div>

					{#if errorText}
						<p class="mt-4 text-xs font-medium text-red-600">{errorText}</p>
					{/if}

					<button
						type="submit"
						disabled={!canSubmitBusiness}
						class="mt-6 inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-zinc-950 px-4 text-[0.8rem] font-medium text-white transition hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500"
					>
						Continue
						<ArrowRight class="size-3.5" />
					</button>
				</form>
			</div>
		</div>
	</section>
{:else if step === 'researchingBusiness'}
	<OnboardingLoadingScreen
		title="Researching the business"
		description="Overbase is building a concise company profile from the name and website."
	/>
{:else if step === 'reviewBusiness'}
	<OnboardingReviewScreen
		title="Review the business profile"
		description="Edit anything that does not match how you describe the company."
		label="What the business does"
		value={businessDescription}
		buttonLabel="Continue"
		{errorText}
		onValueChange={(value) => {
			businessDescription = value;
		}}
		onContinue={() => {
			void submitBusinessDescription();
		}}
	/>
{:else if step === 'researchingGoToMarket'}
	<OnboardingLoadingScreen
		title="Understanding go-to-market"
		description="Overbase is turning the company profile into a practical view of buyers, channels, and useful signals."
	/>
{:else if step === 'reviewGoToMarket'}
	<OnboardingReviewScreen
		title="Review the go-to-market profile"
		description="Edit this so the recommendations match how the business actually reaches customers."
		label="How the business goes to market"
		value={goToMarketDescription}
		buttonLabel="Find blueprints"
		{errorText}
		onValueChange={(value) => {
			goToMarketDescription = value;
		}}
		onContinue={() => {
			void submitGoToMarketDescription();
		}}
	/>
{:else if step === 'recommendingBlueprints'}
	<OnboardingLoadingScreen
		title="Matching blueprints"
		description="Overbase is ranking the available notification blueprints against the business context."
	/>
{:else}
	<section class="min-h-dvh bg-zinc-50 px-4 py-6">
		<div class="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-5xl flex-col justify-center">
			<div class="mx-auto max-w-xl text-center">
				<p class="text-[0.64rem] font-medium uppercase tracking-[0.16em] text-zinc-400">
					Recommended blueprints
				</p>
				<h1 class="mt-3 text-2xl font-semibold tracking-normal text-zinc-950">
					Start with the workflow that fits best.
				</h1>
				<p class="mt-2 text-[0.8rem] leading-relaxed text-zinc-500">
					These recommendations use your reviewed business and go-to-market context.
				</p>
			</div>

			{#if recommendations.length > 0}
				<div class="mt-8 flex flex-wrap justify-center gap-3">
					{#each recommendations as blueprint (blueprint.appSlug)}
						{@const Icon = getArtworkIcon(blueprint.artwork.card.iconId)}
						<button
							type="button"
							class="group flex w-full max-w-[18.5rem] flex-col overflow-hidden rounded-sm border border-zinc-200 bg-white p-1.5 text-left transition hover:border-zinc-300 hover:bg-zinc-50/70 focus:outline-none focus-visible:ring-3 focus-visible:ring-zinc-200"
							onclick={() => {
								void selectBlueprint(blueprint);
							}}
						>
							<div
								class={cn(
									'relative aspect-[1.65/1] w-full overflow-hidden rounded-[0.3rem]',
									cardToneClass[blueprint.artwork.card.tone]
								)}
							>
								<div
									class="absolute inset-x-[14%] top-[16%] bottom-0 rounded-t-[0.45rem] border border-white/80 bg-white/90"
								>
									<div class="flex h-full items-center justify-center">
										<Icon
											class={blueprint.artwork.card.symbolSize === 'sm'
												? 'size-7 text-zinc-950'
												: 'size-8 text-zinc-950'}
										/>
									</div>
								</div>
							</div>

							<div class="flex flex-1 flex-col px-1.5 pb-1.5 pt-3">
								<h2 class="text-base font-semibold tracking-normal text-zinc-950">
									{blueprint.title}
								</h2>
								<p class="mt-1.5 text-[0.78rem] leading-relaxed text-zinc-500">{blueprint.description}</p>
								<p class="mt-3 rounded-sm bg-zinc-50 px-2.5 py-2 text-[0.72rem] leading-relaxed text-zinc-600">
									{blueprint.reason}
								</p>
								<div class="mt-4 flex items-center justify-between text-[0.8rem] font-medium text-zinc-950">
									<span>Open blueprint</span>
									<span
										class="flex size-7 items-center justify-center rounded-full bg-zinc-950 text-white transition group-hover:bg-zinc-800"
									>
										<ArrowRight class="size-3.5" />
									</span>
								</div>
							</div>
						</button>
					{/each}
				</div>
			{:else}
				<div class="mx-auto mt-8 w-full max-w-sm rounded-sm border border-zinc-200 bg-white p-5 text-center">
					<Flag class="mx-auto size-5 text-zinc-950" />
					<h2 class="mt-3 text-sm font-semibold tracking-normal text-zinc-950">
						No blueprints are available
					</h2>
					<p class="mt-2 text-[0.78rem] leading-relaxed text-zinc-500">
						The builder gallery can still open once blueprint runtimes are available.
					</p>
					<button
						type="button"
						class="mt-4 inline-flex h-9 items-center justify-center rounded-full bg-zinc-950 px-4 text-[0.8rem] font-medium text-white transition hover:bg-zinc-800"
						onclick={() => {
							void openBuilderGallery();
						}}
					>
						Open builder
					</button>
				</div>
			{/if}
		</div>
	</section>
{/if}
