<script lang="ts">
	import MobileNavList from '$lib/chrome/mobile/MobileNavList.svelte';
	import { X } from 'lucide-svelte';
	import HomeLink from '$lib/chrome/shared/HomeLink.svelte';
	import { NAV_FOOTER_ITEMS, NAV_SECTIONS } from '$lib/chrome/shared/nav';
	import { useChromeShellState } from '$lib/chrome/shared/shell.svelte';

	type Props = {
		currentPathname: string;
	};

	let { currentPathname }: Props = $props();
	const shellState = useChromeShellState();
</script>

{#if shellState.isMobileDrawerOpen}
	<div class="app-layer-drawer fixed inset-0 pointer-events-auto md:hidden">
		<aside id="mobile-nav-drawer" class="flex h-full flex-col bg-white">
			<header class="flex h-11 items-center border-b border-zinc-100 bg-white px-(--shell-gutter-mobile)">
				<HomeLink
					onclick={() => {
						shellState.isMobileDrawerOpen = false;
					}}
				/>
				<button
					type="button"
					aria-label="Close navigation menu"
					class="ml-auto inline-flex size-8 items-center justify-center rounded-sm text-zinc-700 transition-colors hover:bg-zinc-100"
					onclick={() => {
						shellState.isMobileDrawerOpen = false;
					}}
				>
					<X class="size-4" />
				</button>
			</header>

			<div class="flex-1 overflow-y-auto px-(--shell-gutter-mobile) py-4">
				<nav aria-label="Dashboard navigation" class="relative mt-2 min-h-full">
					<MobileNavList
						sections={NAV_SECTIONS}
						footerItems={NAV_FOOTER_ITEMS}
						{currentPathname}
						onRouteSelect={() => {
							shellState.isMobileDrawerOpen = false;
						}}
					/>
				</nav>
			</div>
		</aside>
	</div>
{/if}
