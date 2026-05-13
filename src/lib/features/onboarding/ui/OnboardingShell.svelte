<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/components/chrome/shared/cn';

	type Props = {
		children: Snippet;
		background: Snippet;
		aside: Snippet;
		footer?: Snippet;
		onReturn?: () => void;
		returnLabel?: string;
		footerBorder?: boolean;
	};

	let {
		children,
		background,
		aside,
		footer,
		onReturn,
		returnLabel = 'Return',
		footerBorder = true
	}: Props = $props();
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
			{#if onReturn}
				<button
					type="button"
					class="inline-flex w-fit cursor-pointer items-center gap-2.5 border-0 bg-transparent p-0 text-sm leading-none text-[#8f9297] outline-none transition-colors hover:text-[#666a70] focus-visible:rounded-sm focus-visible:shadow-[0_0_0_3px_rgb(18_150_247_/_22%)]"
					onclick={onReturn}
				>
					<ArrowLeft aria-hidden="true" class="size-3.5" strokeWidth={1.8} />
					<span>{returnLabel}</span>
				</button>
			{/if}

			<div class="m-auto w-full max-w-95">
				{@render children()}
			</div>

			{#if footer}
				<footer class={cn('w-full pt-4', footerBorder && 'border-t border-[#eceef1]')}>
					{@render footer()}
				</footer>
			{/if}
		</section>

		<aside
			class="relative hidden min-h-[calc(100dvh-16px)] overflow-hidden bg-transparent lg:block"
			aria-label="Customer quote"
		>
			{@render aside()}
		</aside>
	</div>
</section>
