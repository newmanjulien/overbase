<script lang="ts">
	import { resolve } from '$app/paths';
	import { Menu } from 'lucide-svelte';
	import EditableHeaderTitle from '$lib/components/chrome/shared/EditableHeaderTitle.svelte';
	import HomeLink from '$lib/components/chrome/shared/HomeLink.svelte';
	import type { HeaderParentHref } from '$lib/components/chrome/shared/route-title.svelte';
	import { useChromeShellState } from '$lib/components/chrome/shared/shell.svelte';

	type HeaderParent = {
		label: string;
		href: HeaderParentHref;
	};

	type Props = {
		title: string;
		titleEditable?: boolean;
		headerParent?: HeaderParent | null;
		onTitleChange?: (title: string) => void;
	};

	let { title, titleEditable = false, headerParent = null, onTitleChange }: Props = $props();
	const shellState = useChromeShellState();
</script>

<header class="flex h-11 items-center border-b border-zinc-100 bg-white px-(--shell-gutter-mobile) md:hidden">
	<div class="flex w-12 items-center">
		<HomeLink />
	</div>
	<div class="min-w-0 flex-1 px-2">
		{#if headerParent}
			<div class="flex min-w-0 flex-col items-center gap-0.5">
				<a
					href={headerParent.href === '/builder' ? resolve('/builder') : resolve('/my-notifications')}
					class="block max-w-full truncate text-center text-[0.66rem] font-medium tracking-wide text-zinc-400 transition-colors hover:text-zinc-700"
				>
					{headerParent.label}
				</a>
				<EditableHeaderTitle
					{title}
					editable={titleEditable}
					align="center"
					textClass="text-[0.74rem] font-medium text-zinc-700"
					inputClass="mx-auto max-w-48"
					{onTitleChange}
				/>
			</div>
		{:else}
			<EditableHeaderTitle
				{title}
				editable={titleEditable}
				align="center"
				textClass="text-[0.74rem] font-medium text-zinc-600"
				inputClass="mx-auto max-w-48"
				{onTitleChange}
			/>
		{/if}
	</div>
	<div class="flex w-12 justify-end">
		<button
			type="button"
			aria-label="Toggle navigation menu"
			class="inline-flex size-8 items-center justify-center rounded-sm text-zinc-700 transition-colors hover:bg-zinc-100"
			onclick={() => {
				shellState.isMobileDrawerOpen = !shellState.isMobileDrawerOpen;
			}}
		>
			<Menu class="size-4" />
		</button>
	</div>
</header>
