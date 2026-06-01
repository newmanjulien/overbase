<script lang="ts">
	import type { ClassValue } from 'clsx';
	import { cn } from '$lib/ui/cn';

	export type EmailFormatActivationStatusBarKind = 'blocked' | 'ready' | 'success';

	type Props = {
		message: string;
		kind?: EmailFormatActivationStatusBarKind;
		class?: ClassValue;
	};

	let { message, kind = 'blocked', class: className = '' }: Props = $props();

	const statusBarClass = $derived(
		cn(
			'px-4 py-2 text-[0.72rem] leading-relaxed md:px-5',
			kind === 'ready' || kind === 'success'
				? 'bg-positive-50 text-positive-700'
				: 'bg-stone-50 text-stone-700',
			className
		)
	);
</script>

<aside class={statusBarClass}>
	{message}
</aside>
