<script lang="ts">
	import BuilderAppGallery from '$lib/features/builder/apps/BuilderAppGallery.svelte';
	import BuilderChat from '$lib/features/builder/chat/BuilderChat.svelte';
</script>

<div class="mx-auto flex min-h-full w-full max-w-172 flex-col items-center pb-12">
	<div class="w-full max-w-172 pt-[clamp(6.5rem,22vh,13rem)]">
		<BuilderChat />
	</div>

	<p class="mt-0 max-w-164 text-center text-[0.76rem] leading-relaxed text-zinc-500 md:text-[0.8rem]">
		Build a custom email notification that tells you what you need to know at just the right time and that perfectly fits into how your team already works
	</p>

	<div class="mt-16 w-full">
		<BuilderAppGallery />
	</div>
</div>
