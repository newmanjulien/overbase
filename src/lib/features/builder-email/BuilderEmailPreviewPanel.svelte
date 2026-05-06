<script lang="ts">
	import { api } from '$convex/_generated/api';
	import type { Id } from '$convex/_generated/dataModel';
	import { createDefaultEmailDraft, type EmailDraft } from '$convex/emailArtifact';
	import {
		fromEditableEmailDraft,
		toEditableEmailDraft,
		type EditableEmailDraft
	} from '$lib/features/builder-email/email-editable-draft';
	import EmailComposeEditor from '$lib/features/builder-email/EmailComposeEditor.svelte';
	import EmailComposePreview from '$lib/features/builder-email/EmailComposePreview.svelte';
	import { useConvexClient, useQuery } from 'convex-svelte';

	type Props = {
		builderSessionId: Id<'builderSessions'> | null;
		resumeToken: string | null;
		onSessionExtended?: (expiresAt: number) => void;
	};

	let { builderSessionId, resumeToken, onSessionExtended }: Props = $props();

	const client = useConvexClient();
	const artifactQuery = useQuery(api.builderSessions.getSessionArtifact, () =>
		builderSessionId && resumeToken ? { builderSessionId, resumeToken } : 'skip'
	);
	const artifact = $derived(artifactQuery.data ?? null);
	const hasArtifactResponse = $derived(artifactQuery.data !== undefined);
	const draft = $derived((artifact?.emailDraft as EmailDraft | undefined) ?? createDefaultEmailDraft());
	const canEdit = $derived(
		Boolean(builderSessionId) &&
			Boolean(resumeToken) &&
			artifact !== null &&
			!artifactQuery.error &&
			!artifact.hasPendingAssistant
	);

	let isEditing = $state(false);
	let isSaving = $state(false);
	let saveError = $state<string | null>(null);
	let editableDraft = $state<EditableEmailDraft>(toEditableEmailDraft(createDefaultEmailDraft()));

	function beginEdit() {
		editableDraft = toEditableEmailDraft(draft);
		saveError = null;
		isEditing = true;
	}

	function cancelEdit() {
		saveError = null;
		isEditing = false;
	}

	async function saveAndPolish() {
		if (!builderSessionId || !resumeToken || isSaving) {
			return;
		}

		isSaving = true;
		saveError = null;

		try {
			const result = await client.mutation(api.builderSessions.saveUserEditedEmailDraft, {
				builderSessionId,
				resumeToken,
				emailDraft: fromEditableEmailDraft(editableDraft)
			});

			onSessionExtended?.(result.expiresAt);
			isEditing = false;
		} catch (error) {
			saveError = error instanceof Error ? error.message : 'Could not save draft edits.';
		} finally {
			isSaving = false;
		}
	}
</script>

<aside class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white text-zinc-950">
	<div class="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5 md:py-5">
		<div class="mx-auto flex min-h-full w-full max-w-[820px] flex-col">
			{#if artifactQuery.error}
				<div class="rounded-sm border border-red-200 bg-red-50 p-3 text-[0.76rem] leading-relaxed text-red-700">
					<p class="font-medium">Email preview could not load.</p>
					<p class="mt-1 text-red-600">{artifactQuery.error.message}</p>
				</div>
			{:else if builderSessionId && !hasArtifactResponse}
				<div></div>
			{:else if builderSessionId && artifact === null}
				<div class="rounded-sm border border-zinc-200 bg-zinc-50 p-3 text-[0.76rem] leading-relaxed text-zinc-600">
					<p class="font-medium text-zinc-800">Email preview unavailable.</p>
					<p class="mt-1">This builder session no longer has an active preview artifact.</p>
				</div>
			{:else if isEditing}
				<EmailComposeEditor
					{editableDraft}
					disabled={isSaving}
					onDraftChange={(nextDraft) => {
						editableDraft = nextDraft;
					}}
				/>
			{:else}
				<EmailComposePreview {draft} />
			{/if}
		</div>
	</div>

	<div class="shrink-0 border-t border-zinc-100 px-4 py-3 md:px-5">
		{#if saveError}
			<p class="mb-2 text-[0.72rem] leading-snug text-red-600">{saveError}</p>
		{/if}

		<div class="flex justify-end gap-2">
			{#if isEditing}
				<button
					type="button"
					class="inline-flex h-8 items-center justify-center rounded-sm border border-zinc-200 bg-white px-3 text-[0.74rem] font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-default disabled:opacity-55"
					disabled={isSaving}
					onclick={cancelEdit}
				>
					Cancel
				</button>
				<button
					type="button"
					class="inline-flex h-8 items-center justify-center rounded-sm bg-zinc-950 px-3 text-[0.74rem] font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-default disabled:bg-zinc-300 disabled:text-zinc-500"
					disabled={!builderSessionId || isSaving}
					onclick={() => void saveAndPolish()}
				>
					{isSaving ? 'Saving...' : 'Save and polish'}
				</button>
			{:else}
				<button
					type="button"
					class="inline-flex h-8 items-center justify-center rounded-sm border border-zinc-200 bg-white px-3 text-[0.74rem] font-medium text-zinc-800 transition-colors hover:bg-zinc-50 disabled:cursor-default disabled:opacity-55"
					disabled={!canEdit}
					onclick={beginEdit}
				>
					Edit draft
				</button>
			{/if}
		</div>
	</div>
</aside>
