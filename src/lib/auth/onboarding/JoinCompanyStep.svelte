<script lang="ts">
	import AuthButton from '$lib/auth/components/AuthButton.svelte';
	import AuthStepFrame from '$lib/auth/components/AuthStepFrame.svelte';
	import AuthTextInput from '$lib/auth/components/AuthTextInput.svelte';

	type Props = {
		name: string;
		website: string;
		errorText: string | null;
		isSubmitting: boolean;
		onContinue: () => void;
	};

	let {
		name = $bindable(),
		website = $bindable(),
		errorText,
		isSubmitting,
		onContinue
	}: Props = $props();
	const canContinue = $derived(
		name.trim().length > 0 && website.trim().length > 0 && !isSubmitting
	);
</script>

<AuthStepFrame title="About your company">
	<form
		class="grid gap-3.5"
		onsubmit={(event) => {
			event.preventDefault();
			if (canContinue) {
				onContinue();
			}
		}}
	>
		<AuthTextInput
			label="Your company's name"
			bind:value={name}
			autocomplete="organization"
			required
			autofocus
		/>
		<AuthTextInput
			label="Your company's website"
			bind:value={website}
			type="url"
			autocomplete="url"
			inputmode="url"
			required
		/>
		<p class="m-0 text-[13px] leading-5 text-[#8f9297]">
			We use your website to understand your company without making you fill out a long profile
		</p>
		{#if errorText}
			<p class="m-0 text-sm leading-5 text-red-600">{errorText}</p>
		{/if}
		<AuthButton type="submit" disabled={!canContinue}>
			{isSubmitting ? 'Saving...' : 'Last step'}
		</AuthButton>
	</form>
</AuthStepFrame>
