<script lang="ts">
	import { api } from '$convex/_generated/api';
	import type { Id } from '$convex/_generated/dataModel';
	import {
		provideAppConvexPreloader,
		type AppConvexPreloaderRenderState
	} from '$lib/app/app-convex-preloader.svelte';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { onDestroy, type Snippet } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	type Props = {
		children: Snippet<[AppConvexPreloaderRenderState]>;
	};

	type WarmSubscription = {
		unsubscribe: () => void;
		expiresAt: ReturnType<typeof setTimeout>;
	};

	const DETAIL_PRELOAD_TTL_MS = 30_000;

	let { children }: Props = $props();
	const client = useConvexClient();
	const emailFormatsQuery = useQuery(api.emailFormats.listEmailFormats);
	const externalDataQuery = useQuery(api.externalData.listExternalDataSources, () => ({}));
	const teammatesQuery = useQuery(api.teammates.listTeammates);
	const detailWarmSubscriptions = new SvelteMap<string, WarmSubscription>();
	const renderState = $derived<AppConvexPreloaderRenderState>({
		showPublicDataCard: Boolean(externalDataQuery.data && externalDataQuery.data.length === 0)
	});

	function clearWarmSubscription(key: string) {
		const warmSubscription = detailWarmSubscriptions.get(key);

		if (!warmSubscription) {
			return;
		}

		clearTimeout(warmSubscription.expiresAt);
		warmSubscription.unsubscribe();
		detailWarmSubscriptions.delete(key);
	}

	function preloadEmailFormatConfiguration(emailFormatId: Id<'emailFormats'>) {
		const key = `email-format-configuration:${emailFormatId}`;
		const existingWarmSubscription = detailWarmSubscriptions.get(key);

		if (existingWarmSubscription) {
			clearTimeout(existingWarmSubscription.expiresAt);
			existingWarmSubscription.expiresAt = setTimeout(
				() => clearWarmSubscription(key),
				DETAIL_PRELOAD_TTL_MS
			);
			return;
		}

		const unsubscribe = client.onUpdate(
			api.emailFormats.getEmailFormatConfiguration,
			{ emailFormatId },
			() => {},
			() => {}
		);

		detailWarmSubscriptions.set(key, {
			unsubscribe,
			expiresAt: setTimeout(() => clearWarmSubscription(key), DETAIL_PRELOAD_TTL_MS)
		});
	}

	$effect(() => {
		void emailFormatsQuery.isLoading;
		void externalDataQuery.isLoading;
		void teammatesQuery.isLoading;
	});

	onDestroy(() => {
		for (const key of detailWarmSubscriptions.keys()) {
			clearWarmSubscription(key);
		}
	});

	provideAppConvexPreloader({
		preloadEmailFormatConfiguration
	});
</script>

{@render children(renderState)}
