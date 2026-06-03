<script lang="ts">
	import {
		Button,
		destructiveButtonClass,
		FileUploadField,
		FullHeightModalShell
	} from '$lib/ui';
	import EditableHeaderTitle from '$lib/app/chrome/shared/EditableHeaderTitle.svelte';
	import type { Id } from '$convex/_generated/dataModel';
	import type { ContactImport } from './linkedin-contacts-csv';
	import {
		linkedinContactsCsvAccept
	} from './linkedin-contacts-upload';
	import { LinkedinContactsUploadState } from './linkedin-contacts-upload-state.svelte';

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
		renaming?: boolean;
		error?: string | null;
		onClose: () => void;
		onDelete: (sourceId: Id<'externalDataSources'>) => void | Promise<void>;
		onRename: (
			sourceId: Id<'externalDataSources'>,
			name: string
		) => void | Promise<void>;
		onReplace: (
			sourceId: Id<'externalDataSources'>,
			contactsImport: ContactImport
		) => boolean | Promise<boolean>;
	};

	let {
		open,
		source,
		deleting = false,
		replacing = false,
		renaming = false,
		error = null,
		onClose,
		onDelete,
		onRename,
		onReplace
	}: Props = $props();

	const contactsUpload = new LinkedinContactsUploadState({ clearImportOnSelect: true });
	let syncedSourceId = $state<Id<'externalDataSources'> | null>(null);
	const busy = $derived(deleting || replacing || renaming);

	function resetReplacementState() {
		contactsUpload.reset();
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
		await contactsUpload.selectFile(file);
	}

	function deleteSource() {
		if (!source || busy) {
			return;
		}

		void onDelete(source.id);
	}

	function renameSource(name: string) {
		if (!source || busy) {
			return;
		}

		void onRename(source.id, name);
	}

	async function replaceSource() {
		if (!source || !contactsUpload.contactsImport || contactsUpload.parsing || busy) {
			return;
		}

		try {
			const replaced = await onReplace(source.id, contactsUpload.contactsImport);

			if (!replaced) {
				return;
			}

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
	{#snippet titleContent()}
		<EditableHeaderTitle
			title={source?.name ?? 'External data'}
			editable={Boolean(source) && !busy}
			onTitleChange={renameSource}
			class="max-w-full"
			textClass="text-sm leading-tight font-medium text-stone-950"
			inputClass="h-7 text-sm text-stone-950 tracking-normal"
			buttonClass="size-6"
		/>
	{/snippet}

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
						disabled={contactsUpload.parsing || busy}
						selectedFile={contactsUpload.selectedFile}
						errorText={contactsUpload.errorText}
						onFileSelected={selectReplacementFile}
					/>
					{#if contactsUpload.contactsImport}
						<p class="mt-2 text-[0.68rem] leading-relaxed text-stone-500">
							{contactsUpload.contactsImport.contacts.length} contacts ready from {contactsUpload.contactsImport.fileName}
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
					disabled={!source || !contactsUpload.contactsImport || contactsUpload.parsing || busy}
					onclick={replaceSource}
				>
					{contactsUpload.parsing ? 'Reading...' : replacing ? 'Replacing...' : 'Replace file'}
				</Button>
			</div>
		{/snippet}
</FullHeightModalShell>
