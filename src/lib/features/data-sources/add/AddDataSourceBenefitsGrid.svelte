<script lang="ts">
	import type { AddDataSourceBenefit } from './data-source-add-content';

	type Props = {
		benefits: AddDataSourceBenefit[];
	};

	let { benefits }: Props = $props();
</script>

<div class="grid gap-x-6 gap-y-5 sm:grid-cols-2">
	{#each benefits as benefit}
		{@const Icon = benefit.icon}
		<section class="grid grid-cols-[1rem_1fr] gap-x-2.5 gap-y-1.5">
			<Icon
				size={16}
				weight="regular"
				class="mt-px text-zinc-500"
				aria-hidden="true"
			/>
			<h3 class="text-[0.76rem] leading-tight font-medium text-zinc-950">{benefit.title}</h3>
			<p class="col-start-2 text-[0.69rem] leading-relaxed text-zinc-600">
				{benefit.description}
			</p>
		</section>
	{/each}
</div>
