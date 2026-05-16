<script lang="ts">
	import { Button, FullHeightModalShell } from '$lib/components/ui';
	import BuildingsIcon from 'phosphor-svelte/lib/BuildingsIcon';
	import ChartLineUpIcon from 'phosphor-svelte/lib/ChartLineUpIcon';
	import IdentificationBadgeIcon from 'phosphor-svelte/lib/IdentificationBadgeIcon';
	import StackSimpleIcon from 'phosphor-svelte/lib/StackSimpleIcon';
	import ShieldCheckIcon from 'phosphor-svelte/lib/ShieldCheckIcon';

	type Props = {
		open: boolean;
		onClose: () => void;
	};

	const externalDataCategories = [
		{
			icon: ChartLineUpIcon,
			title: 'Bloomberg, S&P, etc.',
			description:
				'Connect the Bloomberg Server API, the S&P Capital IQ API or other sources of financial data'
		},
		{
			icon: IdentificationBadgeIcon,
			title: 'Zoominfo, etc.',
			description:
				'Pull in lead generation data and contact details from Zoominfo or other data providers'
		},
		{
			icon: BuildingsIcon,
			title: 'Grata, Crunchbase, etc.',
			description:
				'Use private company data from Grata, Crunchbase or other leading data providers'
		},
		{
			icon: StackSimpleIcon,
			title: 'Any other data source',
			description:
				'Connect any external data source to power your opportunities with the deepest insight'
		}
	];

	const engineeringCalendarUrl = 'https://cal.com/juliennewman/julien';

	let { open, onClose }: Props = $props();

	function openEngineeringCalendar() {
		window.open(engineeringCalendarUrl, '_blank', 'noopener,noreferrer');
	}
</script>

<FullHeightModalShell
	{open}
	title="Add external data"
	subtitle="Connect any external APIs or data sources you have purchased"
	placement="center"
	{onClose}
>
	<div class="flex min-h-full flex-col justify-between gap-6 pt-1">
		<div class="space-y-5">
			<p class="text-[0.72rem] leading-relaxed text-zinc-600">
				Overbase's engineers will work with your IT team to integrate any external data sources you have purchased
			</p>

			<div class="grid gap-x-6 gap-y-5 sm:grid-cols-2">
				{#each externalDataCategories as category}
					{@const Icon = category.icon}
					<section class="grid grid-cols-[1rem_1fr] gap-x-2.5 gap-y-1.5">
						<Icon size={16} weight="regular" class="mt-px text-zinc-500" aria-hidden="true" />
						<h3 class="text-[0.76rem] leading-tight font-medium text-zinc-950">{category.title}</h3>
						<p class="col-start-2 text-[0.69rem] leading-relaxed text-zinc-600">
							{category.description}
						</p>
					</section>
				{/each}
			</div>
		</div>

		<aside
			class="flex items-start gap-2.5 rounded-[0.45rem] border border-blue-100/70 bg-blue-50/50 px-3.5 py-3 text-blue-500"
		>
			<ShieldCheckIcon size={16} weight="regular" class="mt-0.5 shrink-0" aria-hidden="true" />
			<p class="text-[0.72rem] leading-relaxed text-zinc-800">
				Connect any of your external data sources quickly and securely
			</p>
		</aside>
	</div>

	{#snippet footer()}
		<Button class="ml-auto" onclick={openEngineeringCalendar}>Talk to our engineers</Button>
	{/snippet}
</FullHeightModalShell>
