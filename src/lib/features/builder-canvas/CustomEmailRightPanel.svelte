<script lang="ts">
	import type { Doc } from '$convex/_generated/dataModel';
	import type { EmailDraft } from '$lib/builder-domain/email';
	import type { BuilderBlueprintRecord } from '$lib/features/builder-data';
	import BuilderBlueprintPanel from '$lib/features/builder-canvas/BuilderBlueprintPanel.svelte';
	import BuilderEmailRunPreviewPanel from '$lib/features/builder-email/BuilderEmailRunPreviewPanel.svelte';

	type Props = {
		blueprint: BuilderBlueprintRecord;
		run: Doc<'customEmailRuns'> | null;
		onSaveDraft: (draft: EmailDraft, baseArtifactVersion: number) => Promise<void>;
	};

	let { blueprint, run, onSaveDraft }: Props = $props();

	const visibleDraft = $derived(run?.visibleEmailDraft ?? null);
	const canEdit = $derived(
		Boolean(
			run &&
				visibleDraft &&
				run.phase === 'ready' &&
				run.artifactVisibility === 'visible' &&
				!run.activeMessageOperationId
		)
	);
</script>

{#if visibleDraft}
	<BuilderEmailRunPreviewPanel
		draft={visibleDraft}
		artifactVersion={run?.artifactVersion ?? 0}
		{canEdit}
		onSave={onSaveDraft}
	/>
{:else}
	<BuilderBlueprintPanel {blueprint} />
{/if}
