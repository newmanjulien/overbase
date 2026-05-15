<script lang="ts">
	import { Button } from '$lib/components/ui';
	import type { TeamMemberItem } from './team-member-list';

	type Props = {
		item: TeamMemberItem;
	};

	let { item }: Props = $props();
</script>

<div class="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3">
	<span class="block truncate text-[0.7rem] text-zinc-950">{item.email}</span>
	<Button
		variant="secondary"
		class="h-7 px-2.5 text-[0.7rem] font-medium"
	>
		Edit
	</Button>
</div>
