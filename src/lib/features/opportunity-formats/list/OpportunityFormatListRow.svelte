<script lang="ts">
	import { resolve } from '$app/paths';
	import { cn } from '$lib/components/chrome/shared/cn';
	import type { SelectableListItem } from '$lib/components/list-page';
	import { PersonAvatar } from '$lib/components/avatar';

	export type OpportunityFormatListItem = SelectableListItem & {
		title: string;
		status: 'active' | 'paused';
		statusLabel: string;
		statusLabelClass: string;
		createdAtLabel: string;
		creator: {
			name: string;
			avatarUrl: string;
		};
	};

	type Props = {
		item: OpportunityFormatListItem;
	};

	let { item }: Props = $props();
</script>

<div class="grid min-w-0 grid-cols-1 items-center gap-x-4 sm:grid-cols-[minmax(0,1fr)_max-content_auto]">
	<div class="min-w-0">
		{#if item.href}
			<a
				href={resolve(item.href as '/')}
				class="flex min-w-0 flex-col gap-0.5 rounded-sm focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:outline-none"
			>
				<span class="truncate text-[0.7rem] text-zinc-950">
					{item.title}
				</span>
				<span class={cn('truncate text-[0.72rem]', item.statusLabelClass)}>
					{item.statusLabel}
				</span>
			</a>
		{:else}
			<span class="flex min-w-0 flex-col gap-0.5">
				<span class="truncate text-[0.7rem] text-zinc-950">
					{item.title}
				</span>
				<span class={cn('truncate text-[0.72rem]', item.statusLabelClass)}>
					{item.statusLabel}
				</span>
			</span>
		{/if}
	</div>

	<div class="hidden whitespace-nowrap text-[0.72rem] text-zinc-400 sm:block">
		{item.createdAtLabel}
	</div>

	<div class="hidden sm:flex">
		<PersonAvatar
			person={item.creator}
			size={22}
			class="ring-1 ring-zinc-200/70"
		/>
	</div>
</div>
