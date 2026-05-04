<script lang="ts">
	import { PanelLeft } from 'lucide-svelte';
	import EditableHeaderTitle from '$lib/chrome/shared/EditableHeaderTitle.svelte';
	import HeaderOverflowButton from '$lib/chrome/shared/HeaderOverflowButton.svelte';
	import { useChromeShellState } from '$lib/chrome/shared/shell.svelte';

	type Props = {
		title: string;
		titleEditable?: boolean;
		onTitleChange?: (title: string) => void;
	};

	let { title, titleEditable = false, onTitleChange }: Props = $props();
	const shellState = useChromeShellState();
</script>

<header class="hidden h-11 items-center border-b border-zinc-100 bg-white px-4 md:flex">
	<div class="flex min-w-0 flex-1 items-center">
		<button
			type="button"
			aria-label="Toggle sidebar"
			class="mr-1 ml-1 inline-flex items-center text-xs font-medium tracking-wide text-zinc-500 transition-colors hover:text-zinc-400"
			onclick={() => {
				shellState.isSidebarExpanded = !shellState.isSidebarExpanded;
			}}
		>
			<PanelLeft class="h-3.5 w-3.5" />
		</button>

		<EditableHeaderTitle
			{title}
			editable={titleEditable}
			{onTitleChange}
			class="flex-1"
		/>
	</div>

	<div class="flex items-center gap-2">
		<HeaderOverflowButton />
	</div>
</header>
