<script lang="ts">
	import type { Doc } from '$convex/_generated/dataModel';
	import type { EmailDraft } from '$lib/features/builder/domain/email-design';
	import type { BuilderBlueprintRecord } from '$lib/features/builder/data';
	import BuilderBlueprintPanel from '$lib/features/builder/canvas/BuilderBlueprintPanel.svelte';
	import BuilderEmailRunPreviewPanel from '$lib/features/builder/email/BuilderEmailRunPreviewPanel.svelte';

	type Props = {
		blueprint: BuilderBlueprintRecord;
		session: Doc<'builderSessions'> | null;
		onSaveDraft: (draft: EmailDraft, baseArtifactVersion: number) => Promise<void>;
	};

	let { blueprint, session, onSaveDraft }: Props = $props();

	const visibleDraft = $derived(session?.visibleEmailDraft ?? null);
	const canEdit = $derived(
		Boolean(
			session &&
				visibleDraft &&
				session.phase === 'ready' &&
				session.artifactVisibility === 'visible' &&
				!session.activeMessageOperationId
		)
	);
</script>

{#if visibleDraft}
	<BuilderEmailRunPreviewPanel
		draft={visibleDraft}
		artifactVersion={session?.artifactVersion ?? 0}
		{canEdit}
		onSave={onSaveDraft}
	/>
{:else}
	<BuilderBlueprintPanel {blueprint} />
{/if}
