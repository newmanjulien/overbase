<script lang="ts">
	import type { Snippet } from 'svelte';
	import OnboardingPatternLayer from '../ui/OnboardingPatternLayer.svelte';
	import OnboardingQuotePanel from '../ui/OnboardingQuotePanel.svelte';
	import OnboardingShell from '../ui/OnboardingShell.svelte';
	import type { OnboardingQuote } from './types';

	type Props = {
		children: Snippet;
		footer?: Snippet;
		showFooter?: boolean;
		onReturn?: () => void;
		returnHref?: string;
		returnLabel?: string;
		footerBorder?: boolean;
	};

	let {
		children,
		footer,
		showFooter = Boolean(footer),
		onReturn,
		returnHref,
		returnLabel,
		footerBorder = true
	}: Props = $props();

	const quote = {
		text: 'Overbase turns business context into a clear path to the opportunities worth building first.',
		personName: 'Morgan Reed',
		personTitle: 'VP Revenue, Northstar Labs',
		avatarSrc: '/onboarding-fred.png',
		avatarAlt: 'Morgan Reed'
	} satisfies OnboardingQuote;
	const shouldShowFooter = $derived(Boolean(footer) && showFooter);
</script>

<OnboardingShell
	{onReturn}
	{returnHref}
	{returnLabel}
	showFooter={shouldShowFooter}
	{footerBorder}
>
	{#snippet background()}
		<OnboardingPatternLayer />
	{/snippet}

	{#snippet aside()}
		<OnboardingQuotePanel {quote} />
	{/snippet}

	{#snippet footer()}
		{#if footer}
			{@render footer()}
		{/if}
	{/snippet}

	{@render children()}
</OnboardingShell>
