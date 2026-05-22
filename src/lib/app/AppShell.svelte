<script lang="ts">
	import { page } from '$app/state';
	import { APP_CONFIG } from '$lib/app/app-config';
	import {
		provideCurrentWorkspaceContext,
		type CurrentWorkspaceContext
	} from '$lib/app/current-workspace.svelte';
	import DesktopHeader from '$lib/app/chrome/desktop/DesktopHeader.svelte';
	import DesktopSidebar from '$lib/app/chrome/desktop/DesktopSidebar.svelte';
	import MobileDrawer from '$lib/app/chrome/mobile/MobileDrawer.svelte';
	import MobileHeader from '$lib/app/chrome/mobile/MobileHeader.svelte';
	import { getActiveNavRoute } from '$lib/app/chrome/shared/nav';
	import {
		provideRouteTitleState,
		type RouteTitleState
	} from '$lib/app/chrome/shared/route-title.svelte';
	import {
		provideChromeShellState,
		type ChromeShellState
	} from '$lib/app/chrome/shared/shell.svelte';
	import type { Snippet } from 'svelte';

	type Props = CurrentWorkspaceContext & {
		children: Snippet;
	};

	type ChromeMode = NonNullable<App.PageData['chromeMode']>;

	let { user, workspace, identity, children }: Props = $props();

	function getChromeMode(chromeMode?: ChromeMode) {
		return chromeMode ?? 'dashboard';
	}

	const currentWorkspace: CurrentWorkspaceContext = {
		get user() {
			return user;
		},
		get workspace() {
			return workspace;
		},
		get identity() {
			return identity;
		}
	};
	const sidebarExpandedByMode = $state<Record<ChromeMode, boolean>>({
		dashboard: true,
		focused: false
	});
	const initialChromeMode = getChromeMode(page.data.chromeMode);
	const activeChromeMode = $derived(getChromeMode(page.data.chromeMode));
	let currentChromeMode = $state(initialChromeMode);
	const shellState = $state<ChromeShellState>({
		isSidebarExpanded: sidebarExpandedByMode[initialChromeMode],
		isMobileDrawerOpen: false,
		toggleSidebar() {
			const nextSidebarExpanded = !shellState.isSidebarExpanded;
			shellState.isSidebarExpanded = nextSidebarExpanded;
			sidebarExpandedByMode[currentChromeMode] = nextSidebarExpanded;
		}
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
		if (currentChromeMode !== activeChromeMode) {
			sidebarExpandedByMode[currentChromeMode] = shellState.isSidebarExpanded;
			currentChromeMode = activeChromeMode;
			shellState.isSidebarExpanded = sidebarExpandedByMode[currentChromeMode];
		}
	});

	$effect(() => {
		routeTitleState.title = routeTitle;
	});

	provideCurrentWorkspaceContext(currentWorkspace);
	provideChromeShellState(shellState);
	provideRouteTitleState(routeTitleState);
</script>

<div class="h-dvh min-h-dvh overflow-hidden bg-zinc-50">
	<div
		class="dashboard-surface flex h-full min-h-0 md:gap-(--dashboard-surface-gap)"
		data-sidebar-state={shellState.isSidebarExpanded ? 'expanded' : 'collapsed'}
	>
		<DesktopSidebar
			currentPathname={page.url.pathname}
			user={currentWorkspace.user}
			identity={currentWorkspace.identity}
			class="hidden md:flex"
		/>

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
