<script lang="ts">
	import CircleNotch from 'phosphor-svelte/lib/CircleNotch';
</script>

<div class="flex min-h-dvh items-center justify-center bg-zinc-50 px-6">
	<CircleNotch aria-hidden="true" size={24} weight="regular" class="animate-spin text-zinc-500" />
	<span class="sr-only">Loading application</span>
</div>
