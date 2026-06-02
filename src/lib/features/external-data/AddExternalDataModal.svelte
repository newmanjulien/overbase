<script lang="ts">
	import {
		Button,
		FullHeightModalShell,
		TallModalCallout,
		TallModalFeatureGrid
	} from '$lib/ui';
	import BuildingsIcon from 'phosphor-svelte/lib/BuildingsIcon';
	import ChartLineUpIcon from 'phosphor-svelte/lib/ChartLineUpIcon';
	import IdentificationBadgeIcon from 'phosphor-svelte/lib/IdentificationBadgeIcon';
	import StackSimpleIcon from 'phosphor-svelte/lib/StackSimpleIcon';

	type Props = {
		open: boolean;
		onClose: () => void;
	};

	const externalDataCategories = [
		{
			icon: ChartLineUpIcon,
			title: 'Bloomberg, S&P, etc.',
			description:
				'Connect Bloomberg, S&P Capital IQ or other financial data sources'
		},
		{
			icon: IdentificationBadgeIcon,
			title: 'Zoominfo, etc.',
			description:
				'Pull in lead generation data and contact details from Zoominfo or similar providers'
		},
		{
			icon: BuildingsIcon,
			title: 'Grata, Crunchbase, etc.',
			description:
				'Use private company data from Grata, Crunchbase or similar providers'
		},
		{
			icon: StackSimpleIcon,
			title: 'Any other external data source',
			description:
				'Connect other external data sources that should power your opportunities'
		}
	];

	const engineeringCalendarUrl = 'https://cal.com/juliennewman/julien';

	let { open, onClose }: Props = $props();
</script>

<FullHeightModalShell
	{open}
	title="Add external data source"
	subtitle="Connect any external data sources you have purchased"
	placement="center"
	{onClose}
>
	<div class="flex min-h-full flex-col justify-between gap-6 pt-1">
		<div class="space-y-5">
			<p class="text-[0.72rem] leading-relaxed text-stone-600">
				Overbase's engineers will work with your IT team to integrate purchased external data sources.
			</p>

			<TallModalFeatureGrid features={externalDataCategories} />
		</div>

		<TallModalCallout text="Connect any of your external data sources quickly and securely" />
	</div>

	{#snippet footer()}
		<Button
			class="ml-auto"
			onclick={() => window.open(engineeringCalendarUrl, '_blank', 'noopener,noreferrer')}
		>
			Talk to our engineers
		</Button>
	{/snippet}
</FullHeightModalShell>
