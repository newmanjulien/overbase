<script lang="ts">
	import ShieldCheckIcon from 'phosphor-svelte/lib/ShieldCheckIcon';

	type Props = {
		text: string;
	};

	let { text }: Props = $props();
</script>

<aside
	class="flex items-start gap-2.5 rounded-[0.45rem] border border-blue-100/70 bg-blue-50/50 px-3.5 py-3 text-blue-500"
>
	<ShieldCheckIcon size={16} weight="regular" class="mt-0.5 shrink-0" aria-hidden="true" />
	<p class="text-[0.72rem] leading-relaxed text-stone-800">
		{text}
	</p>
</aside>
