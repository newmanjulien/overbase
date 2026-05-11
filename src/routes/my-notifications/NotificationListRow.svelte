<script lang="ts">
	import { resolve } from '$app/paths';
	import { cn } from '$lib/components/chrome/shared/cn';
	import PersonAvatar from '$lib/components/chrome/shared/PersonAvatar.svelte';
	import type { NotificationListItem } from './notification-list';

	type Props = {
		item: NotificationListItem;
	};

	let { item }: Props = $props();
</script>

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
