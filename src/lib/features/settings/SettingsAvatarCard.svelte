<script lang="ts">
	import { PersonAvatar } from '$lib/components/people';
	import SettingsCard from './SettingsCard.svelte';

	type AvatarPerson = {
		name: string;
		avatar: string;
	};

	type Props = {
		title: string;
		description: string[];
		footerText: string;
		person: AvatarPerson;
		ariaLabel: string;
	};

	let { title, description, footerText, person, ariaLabel }: Props = $props();
</script>

<SettingsCard {title} {description}>
	{#snippet media()}
		<button
			type="button"
			class="inline-flex size-[68px] shrink-0 items-center justify-center rounded-full outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2"
			aria-label={ariaLabel}
		>
			<PersonAvatar
				{person}
				size={68}
				class="border border-zinc-200/70 bg-zinc-100 text-xl text-zinc-500"
			/>
		</button>
	{/snippet}

	{#snippet footer()}
		<p>{footerText}</p>
	{/snippet}
</SettingsCard>
