<script lang="ts">
	import InfoIcon from 'phosphor-svelte/lib/InfoIcon';
	import { useClerkContext } from 'svelte-clerk';
	import { useViewerSession } from '$lib/auth/viewer-session.svelte';
	import { Button, ModalShell } from '$lib/ui';
	import SettingsCard from './SettingsCard.svelte';

	const CONFIRMATION_TEXT = 'delete my account';
	const DESTRUCTIVE_BUTTON_CLASS =
		'bg-red-600 text-white hover:bg-red-700 disabled:bg-zinc-100 disabled:text-zinc-400';

	const clerk = useClerkContext();
	const viewerSession = useViewerSession();

	let modalOpen = $state(false);
	let confirmationText = $state('');
	let errorText = $state<string | null>(null);
	let deleting = $state(false);

	const trimmedConfirmationText = $derived(confirmationText.trim());
	const canDeleteAccount = $derived(trimmedConfirmationText === CONFIRMATION_TEXT);

	function resetModalState() {
		confirmationText = '';
		errorText = null;
		deleting = false;
	}

	function openDeleteModal() {
		resetModalState();
		modalOpen = true;
	}

	function closeDeleteModal() {
		if (deleting) {
			return;
		}

		modalOpen = false;
		resetModalState();
	}

	function getErrorMessage(error: unknown, fallback: string) {
		return error instanceof Error ? error.message : fallback;
	}

	async function signOutDeletedUser() {
		try {
			await viewerSession.signOut();
		} catch {
			viewerSession.reset();
		}
	}

	async function deleteAccount() {
		if (!canDeleteAccount || deleting) {
			return;
		}

		errorText = null;

		if (!clerk.isLoaded || !clerk.user) {
			errorText = 'Unable to delete your account right now.';
			return;
		}

		if (!clerk.user.deleteSelfEnabled) {
			errorText =
				'Clerk account self-deletion is disabled. Enable user self-deletion in the Clerk Dashboard.';
			return;
		}

		deleting = true;

		try {
			await clerk.user.delete();
			await signOutDeletedUser();
			modalOpen = false;
			resetModalState();
		} catch (error) {
			errorText = getErrorMessage(error, 'Unable to delete your account.');
			deleting = false;
		}
	}
</script>

<SettingsCard
	title="Delete Account"
	description="Permanently remove your account and all workspace access from Overbase. This action is not reversible."
>
	<div
		class="mt-4 flex min-h-9 items-center gap-2 rounded-sm bg-zinc-100 px-3 text-[0.74rem] leading-5 text-zinc-600"
	>
		<InfoIcon size={15} weight="regular" class="shrink-0 text-zinc-500" />
		<p>Deleting your account removes your Clerk identity and permanently deletes Overbase data.</p>
	</div>

	{#snippet footer()}
		<p>Overbase data is deleted after Clerk confirms the account deletion.</p>
	{/snippet}

	{#snippet action()}
		<Button
			class={DESTRUCTIVE_BUTTON_CLASS}
			onclick={openDeleteModal}
		>
			Delete account
		</Button>
	{/snippet}
</SettingsCard>

<ModalShell open={modalOpen} title="Delete account" onClose={closeDeleteModal}>
	<div class="space-y-4">
		<p class="text-sm leading-6 text-zinc-700">
			This permanently deletes your account. Overbase will remove workspace data after Clerk
			confirms deletion.
		</p>

		<div>
			<label for="delete-account-confirmation" class="block text-xs text-zinc-950">
				Type delete my account to continue
			</label>
			<input
				id="delete-account-confirmation"
				type="text"
				bind:value={confirmationText}
				autocomplete="off"
				class="mt-2 h-9 w-full rounded-sm border border-zinc-200/80 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 disabled:bg-zinc-50 disabled:text-zinc-500"
				disabled={deleting}
				oninput={() => {
					errorText = null;
				}}
			/>
		</div>

		{#if errorText}
			<p class="text-[0.72rem] leading-5 text-red-700">{errorText}</p>
		{/if}
	</div>

	{#snippet footer()}
		<Button variant="secondary" disabled={deleting} onclick={closeDeleteModal}>Cancel</Button>
		<Button
			disabled={!canDeleteAccount || deleting}
			class={DESTRUCTIVE_BUTTON_CLASS}
			onclick={deleteAccount}
		>
			{deleting ? 'Deleting...' : 'Delete account'}
		</Button>
	{/snippet}
</ModalShell>
