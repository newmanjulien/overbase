<script lang="ts">
	import { page } from '$app/state';
	import { APP_CONFIG } from '$lib/app/app-config';
	import DesktopHeader from '$lib/components/chrome/desktop/DesktopHeader.svelte';
	import DesktopSidebar from '$lib/components/chrome/desktop/DesktopSidebar.svelte';
	import MobileDrawer from '$lib/components/chrome/mobile/MobileDrawer.svelte';
	import MobileHeader from '$lib/components/chrome/mobile/MobileHeader.svelte';
	import { getActiveNavRoute } from '$lib/components/chrome/shared/nav';
	import {
		provideRouteTitleState,
		type RouteTitleState
	} from '$lib/components/chrome/shared/route-title.svelte';
	import {
		provideChromeShellState,
		type ChromeShellState
	} from '$lib/components/chrome/shared/shell.svelte';
	import { setupAppConvex } from '$lib/backend/convex/setup.svelte';
	import { OnboardingFlow } from '$lib/features/onboarding/flow';
	import '../app.css';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	const onboardingEnabled = APP_CONFIG.onboarding.enabled;
	let onboardingComplete = $state(!onboardingEnabled);

	const shellState = $state<ChromeShellState>({
		isSidebarExpanded: false,
		isMobileDrawerOpen: false
	});
	const routeTitleState = $state<RouteTitleState>({
		title: APP_CONFIG.name,
		onTitleChange: null,
		actions: null,
		overflowActions: []
	});
	const activeRoute = $derived(getActiveNavRoute(page.url.pathname));
	const sourceRouteTitle = $derived(page.data.headerTitle ?? activeRoute?.label ?? APP_CONFIG.name);
	const routeTitleResetKey = $derived(`${page.url.pathname}:${sourceRouteTitle}`);
	const routeTitleEditable = $derived(Boolean(page.data.headerTitleEditable));
	const desktopHeaderParent = $derived(page.data.headerParent ?? null);
	const mobileHeaderParent = $derived(
		page.data.headerParentVisibility === 'desktopOnly' ? null : desktopHeaderParent
	);
	let customRouteTitle = $state<string | null>(null);
	let currentRouteTitleResetKey = $state('');

	const routeTitle = $derived(customRouteTitle ?? sourceRouteTitle);

	async function handleRouteTitleChange(title: string) {
		const previousTitle = routeTitleState.title;
		customRouteTitle = title;
		routeTitleState.title = title;

		try {
			await routeTitleState.onTitleChange?.(title);
		} catch {
			customRouteTitle = previousTitle;
			routeTitleState.title = previousTitle;
		}
	}

	$effect(() => {
		if (currentRouteTitleResetKey !== routeTitleResetKey) {
			currentRouteTitleResetKey = routeTitleResetKey;
			customRouteTitle = null;
		}
	});

	$effect(() => {
		routeTitleState.title = routeTitle;
	});

	provideChromeShellState(shellState);
	provideRouteTitleState(routeTitleState);
	setupAppConvex();
</script>

<svelte:head>
	<title>{APP_CONFIG.name}</title>
</svelte:head>

{#if onboardingComplete}
	<div class="h-dvh min-h-dvh overflow-hidden bg-zinc-50">
		<div
			class="dashboard-surface flex h-full min-h-0 md:gap-(--dashboard-surface-gap)"
			data-sidebar-state={shellState.isSidebarExpanded ? 'expanded' : 'collapsed'}
		>
			<DesktopSidebar currentPathname={page.url.pathname} class="hidden md:flex" />

			<main
				class="min-w-0 flex min-h-0 flex-1 flex-col overflow-hidden bg-white md:rounded-sm md:border md:border-zinc-100"
			>
				<MobileDrawer currentPathname={page.url.pathname} />
				<MobileHeader
					title={routeTitleState.title}
					titleEditable={routeTitleEditable}
					headerParent={mobileHeaderParent}
					onTitleChange={handleRouteTitleChange}
				/>

				<div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
					<DesktopHeader
						title={routeTitleState.title}
						titleEditable={routeTitleEditable}
						headerParent={desktopHeaderParent}
						onTitleChange={handleRouteTitleChange}
						actions={routeTitleState.actions}
						overflowActions={routeTitleState.overflowActions}
					/>

					<div class="dashboard-main-viewport min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
						<div class="h-full min-h-full min-w-0">
							{@render children()}
						</div>
					</div>
				</div>
			</main>
		</div>
	</div>
{:else}
	<OnboardingFlow
		onComplete={() => {
			onboardingComplete = true;
		}}
	/>
{/if}
