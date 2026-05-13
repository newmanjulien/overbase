<script lang="ts">
	import { tick } from 'svelte';

	type Props = {
		label: string;
		value: string;
		placeholder?: string;
		type?: 'text' | 'url';
		autocomplete?: 'organization' | 'url';
		required?: boolean;
		autofocus?: boolean;
	};

	let {
		label,
		value = $bindable(),
		placeholder = '',
		type = 'text',
		autocomplete,
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
		{required}
		class="box-border h-[42px] w-full rounded-lg border border-[#e2e3e6] bg-white px-3.5 text-sm leading-none text-[#202124] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#8f9297] focus:border-[#6bbdf8] focus:shadow-[0_0_0_1px_#6bbdf8]"
	/>
</label>
