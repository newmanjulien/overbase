<script lang="ts">
	import { validatePublicAuthEnv } from '$lib/auth/auth-env';
	import { setupAppConvex } from '$lib/backend/convex/setup.svelte';
	import { ClerkProvider } from 'svelte-clerk';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
	const authEnv = validatePublicAuthEnv();
	setupAppConvex(authEnv);
</script>

<ClerkProvider publishableKey={authEnv.clerkPublishableKey}>
	{@render children()}
</ClerkProvider>
