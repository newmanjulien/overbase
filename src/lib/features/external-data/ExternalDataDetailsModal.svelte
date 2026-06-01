<script lang="ts">
	import {
		Button,
		destructiveButtonClass,
		FileUploadField,
		FullHeightModalShell
	} from '$lib/ui';
	import type { Id } from '$convex/_generated/dataModel';
	import type { ContactImport } from './linkedin-contacts-csv';
	import {
		linkedinContactsCsvAccept,
		readLinkedinContactsCsvFile
	} from './linkedin-contacts-upload';

	export type ExternalDataDetails = {
		id: Id<'externalDataSources'>;
		name: string;
		type: string;
		sourceFileName: string;
	};

	type Props = {
		open: boolean;
		source: ExternalDataDetails | null;
		deleting?: boolean;
		replacing?: boolean;
		error?: string | null;
		onClose: () => void;
		onDelete: (sourceId: Id<'externalDataSources'>) => void | Promise<void>;
		onReplace: (
			sourceId: Id<'externalDataSources'>,
			contactsImport: ContactImport
		) => void | Promise<void>;
	};

	let {
		open,
		source,
		deleting = false,
		replacing = false,
		error = null,
		onClose,
		onDelete,
		onReplace
	}: Props = $props();

	let selectedContactCsvFile = $state<File | null>(null);
	let replacementContactsImport = $state<ContactImport | null>(null);
	let uploadErrorText = $state<string | null>(null);
	let parsing = $state(false);
	let syncedSourceId = $state<Id<'externalDataSources'> | null>(null);
	const busy = $derived(deleting || replacing);

	function resetReplacementState() {
		selectedContactCsvFile = null;
		replacementContactsImport = null;
		uploadErrorText = null;
		parsing = false;
	}

	$effect(() => {
		const sourceId = open ? (source?.id ?? null) : null;

		if (sourceId === syncedSourceId) {
			return;
		}

		syncedSourceId = sourceId;
		resetReplacementState();
	});

	async function selectReplacementFile(file: File) {
		selectedContactCsvFile = file;
		replacementContactsImport = null;
		uploadErrorText = null;
		parsing = true;

		try {
			replacementContactsImport = await readLinkedinContactsCsvFile(file);
		} catch (error) {
			uploadErrorText =
				error instanceof Error ? error.message : 'Could not read this CSV.';
		} finally {
			parsing = false;
		}
	}

	function deleteSource() {
		if (!source || busy) {
			return;
		}

		void onDelete(source.id);
	}

	async function replaceSource() {
		if (!source || !replacementContactsImport || parsing || busy) {
			return;
		}

		try {
			await onReplace(source.id, replacementContactsImport);
			resetReplacementState();
		} catch {
			// The page owns the visible action error.
		}
	}
</script>

<FullHeightModalShell
	{open}
	title={source?.name ?? 'External data'}
	subtitle="Manage this external data source"
	placement="right"
	{onClose}
>
	{#if source}
		<div class="space-y-5 pt-1">
			<div class="grid gap-3 text-[0.72rem]">
				<div class="grid grid-cols-[8rem_minmax(0,1fr)] gap-3 border-b border-stone-100 pb-3">
					<span class="text-stone-500">Type</span>
					<span class="min-w-0 truncate font-medium text-stone-950">{source.type}</span>
				</div>
				<div class="grid grid-cols-[8rem_minmax(0,1fr)] gap-3 border-b border-stone-100 pb-3">
					<span class="text-stone-500">Source file</span>
					<span class="min-w-0 truncate font-medium text-stone-950">{source.sourceFileName}</span>
				</div>
			</div>

			<div>
				<FileUploadField
					label="Replace LinkedIn export"
					description="Upload a new Connections.csv file to replace this source"
					accept={linkedinContactsCsvAccept}
					disabled={parsing || busy}
					selectedFile={selectedContactCsvFile}
					errorText={uploadErrorText}
					onFileSelected={selectReplacementFile}
				/>
				{#if replacementContactsImport}
					<p class="mt-2 text-[0.68rem] leading-relaxed text-stone-500">
						{replacementContactsImport.contacts.length} contacts ready from {replacementContactsImport.fileName}
					</p>
				{/if}
			</div>

			{#if error}
				<p class="rounded-sm bg-red-50 px-3 py-2 text-[0.72rem] text-red-700">{error}</p>
			{/if}
		</div>
	{/if}

	{#snippet footer()}
		<Button variant="secondary" disabled={busy} onclick={onClose}>Cancel</Button>
		<div class="flex items-center gap-2">
			<Button
				class={destructiveButtonClass}
				disabled={!source || busy}
				onclick={deleteSource}
			>
				{deleting ? 'Deleting...' : 'Delete'}
			</Button>
			<Button
				disabled={!source || !replacementContactsImport || parsing || busy}
				onclick={replaceSource}
			>
				{parsing ? 'Reading...' : replacing ? 'Replacing...' : 'Replace file'}
			</Button>
		</div>
	{/snippet}
</FullHeightModalShell>
