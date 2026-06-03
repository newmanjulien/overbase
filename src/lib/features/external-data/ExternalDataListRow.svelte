<script lang="ts">
	import { Button } from '$lib/ui';
	import type { ListRowItem } from '$lib/layout/list';

	export type ExternalDataListItem = ListRowItem & {
		name: string;
		type: string;
		logoSrc: string;
		onManage: () => void;
	};

	type Props = {
		item: ExternalDataListItem;
	};

	let { item }: Props = $props();
</script>

<div
	class="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2"
>
	<div class="flex min-w-0 items-center gap-3">
		<img
			src={item.logoSrc}
			alt=""
			class="size-8 shrink-0 rounded-full object-cover ring-1 ring-stone-200/70"
		/>

		<div class="min-w-0">
			<div class="flex min-w-0 items-center gap-2">
				<span class="truncate text-[0.7rem] font-medium text-stone-950">{item.name}</span>
			</div>
			<span class="mt-0.5 block truncate text-[0.72rem] text-stone-500">{item.type}</span>
		</div>
	</div>

	<Button
		variant="secondary"
		class="h-7 px-2.5 text-[0.7rem] font-medium"
		onclick={item.onManage}
	>
		Manage
	</Button>
</div>
