<script lang="ts">
	import InfoIcon from 'phosphor-svelte/lib/InfoIcon';
	import { Button } from '$lib/components/ui';
	import SettingsCard from './SettingsCard.svelte';
</script>

<SettingsCard
	title="Delete Account"
	description="Permanently remove your account and all workspace access from Overbase. This action is not reversible."
>
	<div
		class="mt-4 flex min-h-9 items-center gap-2 rounded-sm bg-zinc-100 px-3 text-[0.74rem] leading-5 text-zinc-600"
	>
		<InfoIcon size={15} weight="regular" class="shrink-0 text-zinc-500" />
		<p>Account deletion is not available in this preview.</p>
	</div>

	{#snippet footer()}
		<p>Deleting your account will be enabled after account management is connected.</p>
	{/snippet}

	{#snippet action()}
		<Button disabled>Delete account</Button>
	{/snippet}
</SettingsCard>
