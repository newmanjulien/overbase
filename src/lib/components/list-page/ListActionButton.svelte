<script lang="ts">
	import { Plus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui';

	type Tone = 'primary' | 'secondary';

	type Props = {
		label: string;
		tone?: Tone;
		class?: string;
	};

	let { label, tone = 'primary', class: className = '' }: Props = $props();
</script>

<Button
	variant={tone}
	class={[
		'text-[0.76rem] font-normal md:text-[0.78rem]',
		tone === 'secondary' && 'text-zinc-950',
		className
	]}
>
	{#snippet leading()}
		<Plus aria-hidden="true" class="size-3.5 stroke-[2.25]" />
	{/snippet}
	<span>{label}</span>
</Button>
