<script lang="ts">
	import { APP_LINKS } from '$lib/app/app-links';
	import {
		Button,
		FullHeightModalShell,
		TallModalCallout,
		TallModalStepList
	} from '$lib/ui';
	import ChecksIcon from 'phosphor-svelte/lib/ChecksIcon';

	type Props = {
		open: boolean;
		onClose: () => void;
	};

	let {
		open,
		onClose
	}: Props = $props();

	const linkDataSourceSteps = [
		{
			title: 'Add data sources',
			description:
				'You will add data sources to Overbase. These can be internal, external or partner data'
		},
		{
			title: 'Link to this rule',
			description:
				'After adding data sources, you will link the right data source to this rule so we know where to look for information'
		},
		{
			title: 'Activate format',
			description:
				'After linking data sources to your rules, you will be able to activate your email format'
		}
	];
</script>

<FullHeightModalShell
	{open}
	title="You don't have data sources yet"
	subtitle="You need to add data sources before you can link them to this rule"
	placement="right"
	{onClose}
>
	<div class="flex min-h-full flex-col justify-between gap-6 pt-1">
		<div class="space-y-5">
			<p class="text-[0.72rem] leading-relaxed text-stone-600">
				You will add data sources to Overbase, then link those data sources to this rule
			</p>

			<TallModalStepList steps={linkDataSourceSteps} />
		</div>

		<TallModalCallout
			icon={ChecksIcon}
			text="First add data sources, then link them to this rule"
		/>
	</div>

	{#snippet footer()}
		<Button variant="secondary" onclick={onClose}>Cancel</Button>
		<Button href={APP_LINKS.internalData.pathname}>Add data sources</Button>
	{/snippet}
</FullHeightModalShell>
