<script lang="ts">
	import { Button, FullHeightModalShell } from '$lib/components/ui';
	import ShieldCheckIcon from 'phosphor-svelte/lib/ShieldCheckIcon';

	type Props = {
		open: boolean;
		onClose: () => void;
	};

	const invitePartnerSteps = [
		{
			title: 'Tell us who you want to invite',
			description:
				'Share the partners you want to work with, what data would be useful and how you want to use it'
		},
		{
			title: 'We help you coordinate with each partner',
			description:
				'You stay in control of each conversation and we make it easy for partners to get set up'
		},
		{
			title: 'You control how your data is shared',
			description:
				'You control what data you share with each of your partners'
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
	title="Invite partners"
	subtitle="Securely share data with your ecosystem partners"
	placement="center"
	{onClose}
>
	<div class="flex min-h-full flex-col justify-between gap-6 pt-1">
		<div class="space-y-5">
			<p class="text-[0.72rem] leading-relaxed text-zinc-600">
				Overbase's success team will work with your partners to let them easily share data with you
			</p>

			<div class="space-y-0">
				{#each invitePartnerSteps as step, index}
					<section class="grid grid-cols-[1.5rem_1fr] gap-x-3">
						<div class="relative flex justify-center">
							<div
								class="z-10 flex size-6 shrink-0 items-center justify-center rounded-full border border-zinc-100 bg-zinc-50/70 text-[0.66rem] leading-none font-normal text-zinc-500"
								aria-hidden="true"
							>
								{index + 1}
							</div>
							{#if index < invitePartnerSteps.length - 1}
								<div class="absolute top-6 bottom-0 w-px bg-zinc-100" aria-hidden="true"></div>
							{/if}
						</div>
						<div class={index < invitePartnerSteps.length - 1 ? 'pb-4' : ''}>
							<h3 class="text-[0.76rem] leading-tight font-medium text-zinc-950">{step.title}</h3>
							<p class="mt-1.5 text-[0.69rem] leading-relaxed text-zinc-600">
								{step.description}
							</p>
						</div>
					</section>
				{/each}
			</div>
		</div>

		<aside
			class="flex items-start gap-2.5 rounded-[0.45rem] border border-blue-100/70 bg-blue-50/50 px-3.5 py-3 text-blue-500"
		>
			<ShieldCheckIcon size={16} weight="regular" class="mt-0.5 shrink-0" aria-hidden="true" />
			<p class="text-[0.72rem] leading-relaxed text-zinc-800">
				Share sales data with your ecosystem partners quickly and securely
			</p>
		</aside>
	</div>

	{#snippet footer()}
		<Button class="ml-auto" onclick={openEngineeringCalendar}>Talk to our success team</Button>
	{/snippet}
</FullHeightModalShell>
