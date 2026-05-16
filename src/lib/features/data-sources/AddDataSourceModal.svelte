<script lang="ts">
	import { Button, FullHeightModalShell } from '$lib/components/ui';
	import ArrowsClockwiseIcon from 'phosphor-svelte/lib/ArrowsClockwiseIcon';
	import Database from 'phosphor-svelte/lib/Database';
	import DatabaseIcon from 'phosphor-svelte/lib/DatabaseIcon';
	import PlugsConnectedIcon from 'phosphor-svelte/lib/PlugsConnectedIcon';
	import ShieldCheckIcon from 'phosphor-svelte/lib/ShieldCheckIcon';

	type Props = {
		open: boolean;
		onClose: () => void;
	};

	const benefits = [
		{
			icon: DatabaseIcon,
			title: 'Internal data sources',
			description:
				'Connect the systems your team already uses so Overbase can understand the operational context behind each opportunity.'
		},
		{
			icon: PlugsConnectedIcon,
			title: 'Format-ready context',
			description:
				'Make selected data available to opportunity formats, partner workflows and future builders without repeating setup.'
		},
		{
			icon: ShieldCheckIcon,
			title: 'Scoped access',
			description:
				'Choose only the sources and fields Overbase should use. Access rules can be tightened before any source is shared.'
		},
		{
			icon: ArrowsClockwiseIcon,
			title: 'Always refreshable',
			description:
				'Keep sources current as your systems change, then reuse the same connection wherever that context is needed.'
		}
	];

	let { open, onClose }: Props = $props();
</script>

<FullHeightModalShell
	{open}
	title="Add data source"
	subtitle="Connect any of your data sources through a custom integration"
	placement="center"
	{onClose}
>
	<div class="flex min-h-full flex-col justify-between gap-6 pt-1">
		<div class="space-y-5">
			<p class="text-[0.72rem] leading-relaxed text-zinc-600">
				Overbase's engineers will build a custom integration to bring together even your most
				disconnected data
			</p>

			<div class="grid gap-x-6 gap-y-5 sm:grid-cols-2">
				{#each benefits as benefit}
					{@const Icon = benefit.icon}
					<section class="grid grid-cols-[1rem_1fr] gap-x-2.5 gap-y-1.5">
						<Icon size={16} weight="regular" class="mt-px text-zinc-500" aria-hidden="true" />
						<h3 class="text-[0.76rem] leading-tight font-medium text-zinc-950">{benefit.title}</h3>
						<p class="col-start-2 text-[0.69rem] leading-relaxed text-zinc-600">
							{benefit.description}
						</p>
					</section>
				{/each}
			</div>
		</div>

		<aside
			class="flex items-start gap-2.5 rounded-[0.45rem] border border-blue-100/70 bg-blue-50/50 px-3.5 py-3 text-blue-500"
		>
			<Database size={16} weight="regular" class="mt-0.5 shrink-0" aria-hidden="true" />
			<p class="text-[0.72rem] leading-relaxed text-zinc-800">
				Start with one trusted source. You can add more systems and refine access once the first
				connection is working.
			</p>
		</aside>
	</div>

	{#snippet footer()}
		<Button class="ml-auto" onclick={onClose}>Add data source</Button>
	{/snippet}
</FullHeightModalShell>
