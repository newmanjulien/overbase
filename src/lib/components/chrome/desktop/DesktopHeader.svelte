<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import { ChevronRight, PanelLeft } from 'lucide-svelte';
	import EditableHeaderTitle from '$lib/components/chrome/shared/EditableHeaderTitle.svelte';
	import HeaderOverflowButton from '$lib/components/chrome/shared/HeaderOverflowButton.svelte';
	import type { HeaderParentHref } from '$lib/components/chrome/shared/route-title.svelte';
	import { useChromeShellState } from '$lib/components/chrome/shared/shell.svelte';
	import { IconButton, type FloatingActionMenuAction } from '$lib/components/ui';

	type HeaderParent = {
		label: string;
		href: HeaderParentHref;
	};

	type Props = {
		title: string;
		titleEditable?: boolean;
		headerParent?: HeaderParent | null;
		onTitleChange?: (title: string) => void;
		actions?: Snippet | null;
		overflowActions?: FloatingActionMenuAction[];
	};

	let {
		title,
		titleEditable = false,
		headerParent = null,
		onTitleChange,
		actions = null,
		overflowActions = []
	}: Props = $props();
	const shellState = useChromeShellState();
</script>

<header class="hidden h-11 items-center border-b border-zinc-100 bg-white px-4 md:flex">
	<div class="flex min-w-0 flex-1 items-center">
		<IconButton
			aria-label="Toggle sidebar"
			variant="ghost"
			class="mr-1 ml-1 size-5 text-zinc-500 hover:bg-transparent hover:text-zinc-400"
			onclick={() => {
				shellState.isSidebarExpanded = !shellState.isSidebarExpanded;
			}}
		>
			<PanelLeft class="h-3.5 w-3.5" />
		</IconButton>

		{#if headerParent}
			<nav aria-label="Breadcrumb" class="ml-2 flex min-w-0 flex-1 items-center gap-1.5">
				<a
					href={headerParent.href === '/builder' ? resolve('/builder') : resolve('/my-notifications')}
					class="block min-w-0 shrink truncate text-[0.74rem] font-medium tracking-wide text-zinc-400 transition-colors hover:text-zinc-600"
				>
					{headerParent.label}
				</a>
				<ChevronRight class="size-3 shrink-0 text-zinc-300" strokeWidth={2.25} />
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
