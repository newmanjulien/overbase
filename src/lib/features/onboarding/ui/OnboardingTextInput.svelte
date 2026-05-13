<script lang="ts">
	import { tick } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = {
		label: string;
		value: string;
		placeholder?: string;
		type?: 'email' | 'text' | 'url';
		autocomplete?: HTMLInputAttributes['autocomplete'];
		inputmode?: HTMLInputAttributes['inputmode'];
		required?: boolean;
		autofocus?: boolean;
	};

	let {
		label,
		value = $bindable(),
		placeholder = '',
		type = 'text',
		autocomplete,
		inputmode,
		required = false,
		autofocus = false
	}: Props = $props();

	let inputElement = $state<HTMLInputElement | null>(null);

	$effect(() => {
		if (!autofocus || !inputElement) {
			return;
		}

		tick().then(() => {
			inputElement?.focus();
			inputElement?.select();
		});
	});
</script>

<label class="block min-w-0">
	<span class="sr-only">{label}</span>
	<input
		bind:this={inputElement}
		bind:value
		placeholder={placeholder || label}
		{type}
		{autocomplete}
		{inputmode}
		{required}
		class="box-border h-10 w-full rounded-md border border-[#e2e3e6] bg-white px-3.5 text-sm leading-none text-[#202124] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#8f9297] focus:border-[#6bbdf8] focus:shadow-[0_0_0_0.5px_#6bbdf8]"
	/>
</label>
