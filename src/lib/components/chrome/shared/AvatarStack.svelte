<script lang="ts">
	import type { ClassValue } from 'clsx';
	import { cn } from '$lib/components/chrome/shared/cn';
	import PersonAvatar from '$lib/components/chrome/shared/PersonAvatar.svelte';

	type AvatarStackPerson = {
		id: string;
		name: string;
		avatar: string;
	};

	type Props = {
		people: readonly AvatarStackPerson[];
		size?: number;
		limit?: number;
		altBase?: string;
		class?: ClassValue;
		avatarClass?: ClassValue;
	};

	let {
		people,
		size = 20,
		limit = 3,
		altBase = 'Teammate',
		class: className = '',
		avatarClass = 'border-2 border-white'
	}: Props = $props();

	const visiblePeople = $derived(people.slice(0, limit));
</script>

<div class={cn('flex items-center -space-x-1', className)}>
	{#each visiblePeople as person, index (person.id)}
		<PersonAvatar
			{person}
			{size}
			class={cn(avatarClass)}
			alt={`${altBase} ${index + 1}`}
		/>
	{/each}
</div>
