<script lang="ts">
	import { tick } from 'svelte';
	import { Pencil } from 'lucide-svelte';
	import { cn } from '$lib/chrome/shared/cn';

	type Props = {
		title: string;
		editable?: boolean;
		align?: 'left' | 'center';
		class?: string;
		textClass?: string;
		inputClass?: string;
		buttonClass?: string;
		onTitleChange?: (title: string) => void;
	};

	let {
		title,
		editable = false,
		align = 'left',
		class: className = '',
		textClass = '',
		inputClass = '',
		buttonClass = '',
		onTitleChange
	}: Props = $props();

	let isEditing = $state(false);
	let draftTitle = $state('');
	let inputElement = $state<HTMLInputElement | null>(null);

	function beginEditing() {
		if (!editable) {
			return;
		}

		draftTitle = title;
		isEditing = true;

		tick().then(() => {
			inputElement?.focus();
			inputElement?.select();
		});
	}

	function commitTitle() {
		const nextTitle = draftTitle.trim();

		if (nextTitle && nextTitle !== title) {
			onTitleChange?.(nextTitle);
		}

		draftTitle = nextTitle || title;
		isEditing = false;
	}

	function cancelEditing() {
		draftTitle = title;
		isEditing = false;
	}

	function handleInput(event: Event) {
		draftTitle = (event.currentTarget as HTMLInputElement).value;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			cancelEditing();
		}
	}

	$effect(() => {
		if (!isEditing) {
			draftTitle = title;
		}
	});
</script>

<div
	class={cn(
		'flex min-w-0 items-center gap-1.5',
		align === 'center' && 'justify-center',
		className
	)}
>
	{#if isEditing}
		<form
			class="min-w-0 flex-1 pr-1"
			onsubmit={(event) => {
				event.preventDefault();
				commitTitle();
			}}
		>
			<input
				bind:this={inputElement}
				value={draftTitle}
				aria-label="Edit header title"
				class={cn(
					'h-7 w-full min-w-0 rounded-sm border border-zinc-200 bg-white px-2 text-xs font-medium tracking-wide text-zinc-700 outline-none transition-colors focus:border-zinc-200',
					align === 'center' && 'text-center',
					inputClass
				)}
				oninput={handleInput}
				onkeydown={handleKeydown}
				onblur={commitTitle}
			/>
		</form>
	{:else}
		<span class={cn('block min-w-0 truncate text-xs font-medium tracking-wide text-zinc-500', textClass)}>
			{title}
		</span>

		{#if editable}
			<button
				type="button"
				aria-label="Edit title"
				class={cn(
					'inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300',
					buttonClass
				)}
				onclick={beginEditing}
			>
				<Pencil class="size-3" strokeWidth={2.5} />
			</button>
		{/if}
	{/if}
</div>
