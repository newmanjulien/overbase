<script lang="ts">
	import type { Snippet } from 'svelte';
	import AuthPageShell from './AuthPageShell.svelte';
	import AuthPatternLayer from './AuthPatternLayer.svelte';
	import AuthQuotePanel from './AuthQuotePanel.svelte';
	import type { AuthQuote } from './types';

	type Props = {
		children: Snippet;
		footer?: Snippet;
		showFooter?: boolean;
		onReturnButtonClick?: () => void;
		returnButtonHref?: string;
		returnLabel?: string;
		footerBorder?: boolean;
	};

	let {
		children,
		footer,
		showFooter = Boolean(footer),
		onReturnButtonClick,
		returnButtonHref,
		returnLabel,
		footerBorder = true
	}: Props = $props();

	const quote = {
		text: 'Overbase turns business context into a clear path to the opportunities worth building first.',
		personName: 'Morgan Reed',
		personTitle: 'VP Revenue, Northstar Labs',
		avatarSrc: '/auth-quote-avatar.png',
		avatarAlt: 'Morgan Reed'
	} satisfies AuthQuote;
	const shouldShowFooter = $derived(Boolean(footer) && showFooter);
</script>

<AuthPageShell
	{onReturnButtonClick}
	{returnButtonHref}
	{returnLabel}
	showFooter={shouldShowFooter}
	{footerBorder}
>
	{#snippet background()}
		<AuthPatternLayer />
	{/snippet}

	{#snippet aside()}
		<AuthQuotePanel {quote} />
	{/snippet}

	{#snippet footer()}
		{#if footer}
			{@render footer()}
		{/if}
	{/snippet}

	{@render children()}
</AuthPageShell>
