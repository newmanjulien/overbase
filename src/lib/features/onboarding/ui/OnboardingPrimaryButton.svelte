<script lang="ts">
	type Props = {
		type?: 'button' | 'submit';
		disabled?: boolean;
		children: import('svelte').Snippet;
		onclick?: () => void;
	};

	let { type = 'button', disabled = false, children, onclick }: Props = $props();
</script>

<button
	{type}
	{disabled}
	{onclick}
	class="relative flex h-9 w-full cursor-pointer items-center justify-center rounded-lg border-0 bg-[#1296f7] px-4 text-sm font-medium leading-none text-white outline-none transition-[background,box-shadow] duration-150 hover:bg-[#0d8eea] focus-visible:shadow-[0_0_0_3px_rgb(18_150_247_/_35%)] disabled:cursor-not-allowed disabled:bg-[#b7dffb]"
>
	{@render children()}
</button>
