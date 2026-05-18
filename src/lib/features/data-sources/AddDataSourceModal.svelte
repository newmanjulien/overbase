<script lang="ts">
	import {
		Button,
		FullHeightModalShell,
		TallModalCallout,
		TallModalFeatureGrid
	} from '$lib/components/ui';
	import BuildingsIcon from 'phosphor-svelte/lib/BuildingsIcon';
	import CalendarDotsIcon from 'phosphor-svelte/lib/CalendarDotsIcon';
	import FilesIcon from 'phosphor-svelte/lib/FilesIcon';
	import StackSimpleIcon from 'phosphor-svelte/lib/StackSimpleIcon';

	type Props = {
		open: boolean;
		onClose: () => void;
	};

	const dataSourceCategories = [
		{
			icon: BuildingsIcon,
			title: 'CRMs and ERPs',
			description:
				'Connect your CRM, ERP or any other system you use to run your operation'
		},
		{
			icon: CalendarDotsIcon,
			title: 'Email, calendar, etc.',
			description:
				'We can analyze emails, calendars, chat system like Slack or Teams or anywhere else you already work'
		},
		{
			icon: FilesIcon,
			title: 'Spreadsheets, PDFs, etc.',
			description:
				'Share your data from where it already lives, even if it lives in spreadsheets, PDFs, etc.'
		},
		{
			icon: StackSimpleIcon,
			title: 'Any other data source',
			description:
				'Connect the most disconnected data from the hardest to access places'
		}
	];

	const engineeringCalendarUrl = 'https://cal.com/juliennewman/julien';

	let { open, onClose }: Props = $props();
</script>

<FullHeightModalShell
	{open}
	title="Add data source"
	subtitle="Connect your company's data sources to power your opportunities"
	placement="center"
	{onClose}
>
	<div class="flex min-h-full flex-col justify-between gap-6 pt-1">
		<div class="space-y-5">
			<p class="text-[0.72rem] leading-relaxed text-zinc-600">
				Overbase's engineers will work with your IT team to bring together even your most
				disconnected data
			</p>

			<TallModalFeatureGrid features={dataSourceCategories} />
		</div>

		<TallModalCallout text="Connect any of your internal data sources quickly and securely" />
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
