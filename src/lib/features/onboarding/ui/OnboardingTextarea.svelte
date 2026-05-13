<script lang="ts">
	type Props = {
		label: string;
		value: string;
		placeholder?: string;
		required?: boolean;
		submitOnEnter?: boolean;
	};

	let {
		label,
		value = $bindable(),
		placeholder = '',
		required = false,
		submitOnEnter = false
	}: Props = $props();

	function handleKeydown(event: KeyboardEvent) {
		if (!submitOnEnter || event.key !== 'Enter' || event.isComposing) {
			return;
		}

		event.preventDefault();

		if (event.currentTarget instanceof HTMLTextAreaElement) {
			event.currentTarget.form?.requestSubmit();
		}
	}
</script>

<label class="block min-w-0">
	<span class="sr-only">{label}</span>
	<textarea
		bind:value
		placeholder={placeholder || label}
		{required}
		rows="5"
		class="box-border min-h-30 w-full resize-none rounded-lg border border-[#e2e3e6] bg-white px-3.5 py-3 text-sm leading-[1.45] text-[#202124] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#8f9297] focus:border-[#6bbdf8] focus:shadow-[0_0_0_1px_#6bbdf8]"
		onkeydown={handleKeydown}
	></textarea>
</label>
