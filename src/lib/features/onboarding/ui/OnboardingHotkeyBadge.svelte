<script lang="ts">
	type Props = {
		label: string;
	};

	let { label }: Props = $props();
</script>

<span
	class="inline-flex h-5 min-w-5 items-center justify-center rounded-sm bg-white/15 px-2 text-xs font-medium text-white/75"
>
	{label}
</span>
