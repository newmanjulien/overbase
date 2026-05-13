<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		background: Snippet;
		aside: Snippet;
	};

	let { children, background, aside }: Props = $props();
</script>

<section class="relative min-h-dvh overflow-auto bg-[#f7f7f7] p-0 text-[#202124] sm:p-2 lg:overflow-hidden">
	{@render background()}

	<div
		class="relative z-[1] block min-h-dvh sm:min-h-[calc(100dvh-16px)] lg:grid lg:grid-cols-[minmax(0,50.2%)_minmax(0,1fr)]"
	>
		<section
			class="box-border flex min-h-dvh flex-col bg-white px-6 pt-12 pb-8 sm:min-h-[calc(100dvh-16px)] sm:rounded-[10px] sm:border sm:border-black/[0.04] lg:px-[clamp(40px,8.55vw,248px)] lg:pt-[clamp(56px,8.6vh,138px)] lg:pb-7"
			aria-label="Overbase onboarding"
		>
			<div class="m-auto w-full max-w-95">
				{@render children()}
			</div>
		</section>

		<aside
			class="relative hidden min-h-[calc(100dvh-16px)] overflow-hidden bg-transparent lg:block"
			aria-label="Customer quote"
		>
			{@render aside()}
		</aside>
	</div>
</section>
