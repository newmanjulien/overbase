<script lang="ts">
	import { Button } from '$lib/components/ui';
	import SettingsCard from './SettingsCard.svelte';

	type Props = {
		title: string;
		description: string;
		value: string;
		fieldId: string;
		label: string;
		footerText: string;
		actionLabel?: string;
	};

	let {
		title,
		description,
		value,
		fieldId,
		label,
		footerText,
		actionLabel = 'Save'
	}: Props = $props();
</script>

<SettingsCard {title} {description}>
	<div class="mt-4 max-w-sm">
		<label class="sr-only" for={fieldId}>{label}</label>
		<input
			id={fieldId}
			type="text"
			readonly
			value={value}
			class="h-8 w-full rounded-sm border border-zinc-200/70 bg-white px-2.5 text-[0.74rem] text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-2 focus:ring-zinc-100"
		/>
	</div>

	{#snippet footer()}
		<p>{footerText}</p>
	{/snippet}

	{#snippet action()}
		<Button disabled>{actionLabel}</Button>
	{/snippet}
</SettingsCard>
