<script lang="ts">
	import { AlertCircle, LoaderCircle } from 'lucide-svelte';
	import { cn } from '$lib/components/chrome/shared/cn';

	type ContentStateKind = 'loading' | 'error';

	type Props = {
		kind: ContentStateKind;
		message: string;
		class?: string;
	};

	let { kind, message, class: className = '' }: Props = $props();

	const Icon = $derived(kind === 'loading' ? LoaderCircle : AlertCircle);
	const toneClass = $derived(
		kind === 'error'
			? 'border-red-100 bg-red-50/40 text-red-700'
			: 'border-zinc-200/70 bg-white text-zinc-500'
	);
</script>

<div
	class={cn(
		'flex min-h-40 items-center justify-center border-y px-4 py-8 text-center text-[0.76rem] md:px-5',
		toneClass,
		className
	)}
>
	<div class="inline-flex items-center gap-2">
		<Icon
			aria-hidden="true"
			class={cn('size-3.5', kind === 'loading' && 'animate-spin')}
		/>
		<span>{message}</span>
	</div>
</div>
