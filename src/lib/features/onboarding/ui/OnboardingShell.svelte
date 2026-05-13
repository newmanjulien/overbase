<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	type FooterLink = {
		label: string;
		href: string;
	};

	type Props = {
		children: Snippet;
		background: Snippet;
		aside: Snippet;
		onReturn?: () => void;
		returnLabel?: string;
		footerLinks?: FooterLink[];
	};

	let {
		children,
		background,
		aside,
		onReturn,
		returnLabel = 'Return',
		footerLinks = []
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

			{#if footerLinks.length > 0}
				<footer class="w-full border-t border-[#eceef1] pt-4">
					<nav class="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] leading-5 text-[#8f9297]">
						{#each footerLinks as link (link.href)}
							<a class="transition-colors hover:text-[#202124]" href={link.href} rel="external">
								{link.label}
							</a>
						{/each}
					</nav>
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
