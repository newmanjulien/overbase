<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import SidebarSimpleIcon from 'phosphor-svelte/lib/SidebarSimpleIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import EditableHeaderTitle from '$lib/app/chrome/shared/EditableHeaderTitle.svelte';
	import HeaderOverflowButton from '$lib/app/chrome/shared/HeaderOverflowButton.svelte';
	import type { BreadcrumbParent } from '$lib/app/chrome/shared/breadcrumb';
	import { useChromeShellState } from '$lib/app/chrome/shared/shell.svelte';
	import { IconButton, type FloatingActionMenuAction } from '$lib/ui';

	type Props = {
		title: string;
		titleEditable?: boolean;
		breadcrumbParent?: BreadcrumbParent | null;
		onTitleChange?: (title: string) => void;
		actions?: Snippet | null;
		overflowActions?: FloatingActionMenuAction[];
	};

	let {
		title,
		titleEditable = false,
		breadcrumbParent = null,
		onTitleChange,
		actions = null,
		overflowActions = []
	}: Props = $props();
	const shellState = useChromeShellState();
</script>

<header class="hidden h-11 items-center border-b border-stone-100 bg-white px-4 md:flex">
	<div class="flex min-w-0 flex-1 items-center">
		<IconButton
			aria-label="Toggle sidebar"
			variant="ghost"
			class="mr-1 ml-1 size-5 text-stone-500 hover:bg-transparent hover:text-stone-400"
			onclick={() => {
				shellState.toggleSidebar();
			}}
		>
			<SidebarSimpleIcon size={14} weight="regular" />
		</IconButton>

		{#if breadcrumbParent}
			<nav aria-label="Breadcrumb" class="ml-2 flex min-w-0 flex-1 items-center gap-1.5">
				<a
					href={resolve(breadcrumbParent.href)}
					class="block min-w-0 shrink truncate text-[0.74rem] font-medium tracking-wide text-stone-400 transition-colors hover:text-stone-600"
				>
					{breadcrumbParent.label}
				</a>
				<CaretRightIcon size={12} weight="regular" class="shrink-0 text-stone-300" />
				<EditableHeaderTitle
					{title}
					editable={titleEditable}
					{onTitleChange}
					class="min-w-0 flex-1"
					textClass="text-[0.74rem] font-medium"
				/>
			</nav>
		{:else}
			<EditableHeaderTitle
				{title}
				editable={titleEditable}
				{onTitleChange}
				class="flex-1"
				textClass="text-[0.74rem] font-medium"
			/>
		{/if}
	</div>

	<div class="flex items-center gap-2">
		{@render actions?.()}
		<HeaderOverflowButton actions={overflowActions} />
	</div>
</header>
