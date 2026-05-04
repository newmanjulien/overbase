<script lang="ts">
	import { Menu } from 'lucide-svelte';
	import EditableHeaderTitle from '$lib/chrome/shared/EditableHeaderTitle.svelte';
	import HomeLink from '$lib/chrome/shared/HomeLink.svelte';
	import { useChromeShellState } from '$lib/chrome/shared/shell.svelte';

	type Props = {
		title: string;
		titleEditable?: boolean;
		onTitleChange?: (title: string) => void;
	};

	let { title, titleEditable = false, onTitleChange }: Props = $props();
	const shellState = useChromeShellState();
</script>

<header class="flex h-11 items-center border-b border-zinc-100 bg-white px-(--shell-gutter-mobile) md:hidden">
	<div class="flex w-12 items-center">
		<HomeLink />
	</div>
	<div class="min-w-0 flex-1 px-2">
		<EditableHeaderTitle
			{title}
			editable={titleEditable}
			align="center"
			textClass="text-zinc-600"
			inputClass="mx-auto max-w-48"
			{onTitleChange}
		/>
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
