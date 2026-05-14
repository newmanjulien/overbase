<script lang="ts">
	import CaretUpDown from 'phosphor-svelte/lib/CaretUpDown';
	import { APP_CONFIG } from '$lib/app/app-config';
	import DesktopNavList from '$lib/components/chrome/desktop/DesktopNavList.svelte';
	import { cn } from '$lib/components/chrome/shared/cn';
	import HomeLink from '$lib/components/chrome/shared/HomeLink.svelte';
	import { PersonAvatar } from '$lib/components/people';
	import {
		getActiveNavRoute,
		NAV_FOOTER_ITEMS,
		NAV_SECTIONS,
		type NavRouteItem
	} from '$lib/components/chrome/shared/nav';
	import { useChromeShellState } from '$lib/components/chrome/shared/shell.svelte';
	import { sidebarIndicator } from '$lib/components/chrome/shared/sidebar-indicator';

	type Props = {
		currentPathname: string;
		class?: string;
	};

	let { currentPathname, class: className = '' }: Props = $props();

	const shellState = useChromeShellState();
	const activeRoute = $derived(getActiveNavRoute(currentPathname));
	let hoveredRoute = $state<NavRouteItem | null>(null);

	const indicatorTarget = $derived.by(() => {
		const targetRoute = hoveredRoute ?? activeRoute;

		return {
			targetKey: targetRoute?.id ?? null,
			enabled: Boolean(targetRoute)
		};
	});
</script>

<aside
	class={cn(
		'flex w-(--dashboard-sidebar-width) shrink-0 self-stretch flex-col overflow-hidden pt-2.5 pl-(--dashboard-sidebar-pad-left) pr-(--dashboard-sidebar-pad-right) transition-[width,padding] duration-200',
		shellState.isSidebarExpanded ? 'items-stretch' : 'items-start',
		className
	)}
	aria-label="Dashboard sidebar"
>
	<div class="mb-4 ml-0.5 flex w-full items-center pr-0.5">
		<HomeLink class="shrink-0" />

		<div
			class={cn(
				'ml-auto flex shrink-0 items-center overflow-hidden transition-[max-width,opacity,transform] duration-200',
				shellState.isSidebarExpanded
					? 'max-w-24 translate-x-0 opacity-100'
					: 'pointer-events-none max-w-0 translate-x-1 opacity-0'
			)}
		>
			<div class="inline-flex h-6 origin-center scale-110 items-center gap-1 rounded-full border border-zinc-100 bg-zinc-50 px-1 text-zinc-100">
				<PersonAvatar
					person={APP_CONFIG.profile}
					size={20}
					class="border border-zinc-100 bg-white"
				/>
				<CaretUpDown aria-hidden="true" size={12} weight="regular" class="text-zinc-400" />
			</div>
		</div>
	</div>

	<nav
		use:sidebarIndicator={indicatorTarget}
		class="relative flex min-h-0 flex-1 flex-col"
		aria-label="Dashboard navigation"
		onmouseleave={() => {
			hoveredRoute = null;
		}}
	>
		<span
			aria-hidden="true"
			class="sidebar-nav-indicator pointer-events-none absolute rounded-sm bg-zinc-200/60 transition-[transform,width,height,opacity] duration-200 ease-out will-change-transform"
		></span>
		<DesktopNavList
			sections={NAV_SECTIONS}
			footerItems={NAV_FOOTER_ITEMS}
			{currentPathname}
			expanded={shellState.isSidebarExpanded}
			onRouteHover={(route) => {
				hoveredRoute = route;
			}}
		/>
	</nav>
</aside>
