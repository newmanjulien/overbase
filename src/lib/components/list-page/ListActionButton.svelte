<script lang="ts">
	import { Plus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui';

	type Tone = 'primary' | 'secondary';

	type Props = {
		label: string;
		tone?: Tone;
		class?: string;
		onclick?: () => void;
	};

	let { label, tone = 'primary', class: className = '', onclick }: Props = $props();
</script>

<Button
	variant={tone}
	class={[
		'text-[0.72rem] font-normal md:text-[0.74rem]',
		tone === 'secondary' && 'border-zinc-200/70 text-zinc-950',
		className
	]}
	{onclick}
>
	{#snippet leading()}
		<Plus aria-hidden="true" class="size-3.5 stroke-[2.25]" />
	{/snippet}
	<span>{label}</span>
</Button>
