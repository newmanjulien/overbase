<script lang="ts">
	import {
		Button,
		FullHeightModalShell,
		TallModalCallout,
		TallModalStepList
	} from '$lib/ui';

	type Props = {
		open: boolean;
		onClose: () => void;
	};

	let { open, onClose }: Props = $props();

	const linkDataSourceSteps = [
		{
			title: 'Set up data sources',
			description:
				'Connect any internal, external or partner data'
		},
		{
			title: 'Link to your rule',
			description:
				'You will link data sources to each rule in your opportunity format'
		},
		{
			title: 'Receive opportunities',
			description:
				'Start receiving custom revenue opportunities backed by the best data'
		}
	];
</script>

<FullHeightModalShell
	{open}
	title="Link data sources"
	subtitle="Set up your data sources so you can link them"
	placement="right"
	{onClose}
>
	<div class="flex min-h-full flex-col justify-between gap-6 pt-1">
		<div class="space-y-5">
			<p class="text-[0.72rem] leading-relaxed text-stone-600">
				You will tell us which data source to use to power each of your rules. But first, you need to set up your data sources
			</p>

			<TallModalStepList steps={linkDataSourceSteps} />
		</div>

		<TallModalCallout
			text="Link any data source to this rule and opportunity format"
		/>
	</div>

	{#snippet footer()}
		<Button variant="secondary" onclick={onClose}>Cancel</Button>
		<Button href="/data-sources">Link data sources</Button>
	{/snippet}
</FullHeightModalShell>
