<script lang="ts">
	import { useConvexClient } from 'convex-svelte';
	import { useClerkContext } from 'svelte-clerk';

	type Props = {
		isReady: boolean;
	};

	let { isReady = $bindable(false) }: Props = $props();
	const client = useConvexClient();
	const clerk = useClerkContext();
	let authVersion = 0;

	$effect(() => {
		const version = (authVersion += 1);
		isReady = false;

		if (!clerk.isLoaded) {
			return;
		}

		if (!clerk.auth.userId) {
			client.setAuth(async () => null);
			isReady = true;
			return;
		}

		client.setAuth(async () => {
			return (await clerk.session?.getToken({ template: 'convex' })) ?? null;
		}, (isAuthenticated) => {
			if (version === authVersion) {
				isReady = isAuthenticated;
			}
		});
	});
</script>
