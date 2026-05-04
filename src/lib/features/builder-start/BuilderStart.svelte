<script lang="ts">
	import BuilderCardSection from '$lib/features/builder-cards/BuilderCardSection.svelte';
	import BuilderChat from '$lib/features/builder-chat/BuilderChat.svelte';
</script>

<div class="mx-auto flex min-h-full w-full max-w-172 flex-col items-center pb-12">
	<div class="w-full max-w-172 pt-[clamp(6.5rem,22vh,13rem)]">
		<BuilderChat />
	</div>

	<p class="mt-0 max-w-164 text-center text-[0.76rem] leading-relaxed text-zinc-500 md:text-[0.8rem]">
		We analyze data from your business and from your ecosystem partners then we send you notifications by email. Build custom notifications that tell you what you need to know and fits how you already work
	</p>

	<div class="mt-16 w-full">
		<BuilderCardSection />
	</div>
</div>
