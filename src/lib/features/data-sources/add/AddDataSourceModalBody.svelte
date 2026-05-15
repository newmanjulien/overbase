<script lang="ts">
	import Database from 'phosphor-svelte/lib/Database';
	import AddDataSourceBenefitsGrid from './AddDataSourceBenefitsGrid.svelte';
	import { addDataSourceBenefits } from './data-source-add-content';
</script>

<div class="flex min-h-full flex-col justify-between gap-6 pt-1">
	<div class="space-y-5">
		<p class="text-[0.72rem] leading-relaxed text-zinc-600">
			Add a data source to give Overbase the context it needs to find better opportunities.
			Start with a core system your team already trusts, then decide where that source can be
			used.
		</p>

		<AddDataSourceBenefitsGrid benefits={addDataSourceBenefits} />
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
