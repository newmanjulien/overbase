<script lang="ts">
	import ListIcon from 'phosphor-svelte/lib/ListIcon';
	import EditableHeaderTitle from '$lib/app/chrome/shared/EditableHeaderTitle.svelte';
	import HomeLink from '$lib/app/chrome/shared/HomeLink.svelte';
	import { useChromeShellState } from '$lib/app/chrome/shared/shell.svelte';
	import { IconButton } from '$lib/ui';

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
			textClass="text-[0.74rem] font-medium text-zinc-600"
			inputClass="mx-auto max-w-48"
			{onTitleChange}
		/>
	</div>
	<div class="flex w-12 justify-end">
		<IconButton
			aria-label="Toggle navigation menu"
			variant="ghost"
			class="size-8 text-zinc-700"
			onclick={() => {
				shellState.isMobileDrawerOpen = !shellState.isMobileDrawerOpen;
			}}
		>
			<ListIcon size={16} weight="regular" />
		</IconButton>
	</div>
</header>
