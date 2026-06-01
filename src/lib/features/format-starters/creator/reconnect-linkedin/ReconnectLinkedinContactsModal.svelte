<script lang="ts">
	import {
		Button,
		FileUploadField,
		FullHeightModalShell,
		TallModalCallout,
		TallModalStepList,
		inlineLinkClass
	} from '$lib/ui';
	import {
		parseContactCsv,
		type ContactImport
	} from './linkedin-contacts-csv';

	type Props = {
		open: boolean;
		contactsImport: ContactImport | null;
		onClose: () => void;
		onContactsImported: (contactsImport: ContactImport) => void;
	};

	let { open, contactsImport, onClose, onContactsImported }: Props = $props();
	let selectedContactCsvFile = $state<File | null>(null);
	let parsedContactsImport = $state<ContactImport | null>(null);
	let uploadErrorText = $state<string | null>(null);
	let parsing = $state(false);
	let syncedContactsImport = $state<ContactImport | null>(null);
	const activeContactsImport = $derived(parsedContactsImport ?? contactsImport);

	const linkedinContactSteps = [
		{
			id: 'linkedin-settings',
			title: 'Go to LinkedIn settings',
			description: "Make sure you're logged into your LinkedIn account then click on: linkedin.com/settings/member-data"
		},
		{
			id: 'request-connections',
			title: 'Request your Connections',
			description: "Select 'Want something in particular?' then check 'Connections' and click 'Request archive'"
		},
		{
			id: 'check-email',
			title: 'Wait then check your email',
			description: "Wait 10 minutes for LinkedIn to prepare your data then check the email you use to sign into LinkedIn (make sure you check the right email)"
		}
	];

	const linkedinSettingsUrl = 'https://www.linkedin.com/settings/member-data';
	const contactCsvAccept = '.csv';
	const csvMimeTypes = new Set([
		'text/csv',
		'application/csv',
		'application/vnd.ms-excel',
		'application/octet-stream'
	]);

	function getFileExtension(fileName: string) {
		return fileName.split('.').pop()?.toLowerCase() ?? '';
	}

	function isCsvFile(file: File) {
		const extension = getFileExtension(file.name);
		const hasAllowedExtension = extension === 'csv';
		const hasAllowedType = !file.type || csvMimeTypes.has(file.type);

		return hasAllowedExtension && hasAllowedType;
	}

	$effect(() => {
		if (contactsImport === syncedContactsImport) {
			return;
		}

		syncedContactsImport = contactsImport;

		if (!contactsImport) {
			selectedContactCsvFile = null;
			parsedContactsImport = null;
			uploadErrorText = null;
			parsing = false;
		}
	});

	async function selectContactCsvFile(file: File) {
		if (!isCsvFile(file)) {
			uploadErrorText = 'Upload a CSV file.';
			return;
		}

		selectedContactCsvFile = file;
		uploadErrorText = null;
		parsing = true;

		try {
			parsedContactsImport = parseContactCsv(file.name, await file.text());
		} catch (error) {
			parsedContactsImport = null;
			uploadErrorText =
				error instanceof Error ? error.message : 'Could not read this CSV.';
		} finally {
			parsing = false;
		}
	}

	function addContacts() {
		if (!activeContactsImport) {
			uploadErrorText = 'Upload a contacts CSV first.';
			return;
		}

		onContactsImported(activeContactsImport);
		onClose();
	}
</script>

<FullHeightModalShell
	{open}
	title="Your personal LinkedIn contacts"
	subtitle="Add your personal LinkedIn contacts to try this email format"
	placement="right"
	{onClose}
>
	<div class="flex min-h-full flex-col justify-between gap-6 pt-1">
		<div class="space-y-5">
			<p class="text-[0.72rem] leading-relaxed text-stone-600">
				LinkedIn contacts are publicly available. But you'll need to export and upload them here so Overbase can process your contacts
			</p>

			<TallModalStepList steps={linkedinContactSteps}>
				{#snippet renderDescription(step)}
					{#if step.id === 'linkedin-settings'}
						Make sure you're logged into your LinkedIn account then click on:
						<a
							class={inlineLinkClass}
							href={linkedinSettingsUrl}
							target="_blank"
							rel="noopener noreferrer"
						>
							linkedin.com/settings/member-data
						</a>
					{:else}
						{step.description}
					{/if}
				{/snippet}
			</TallModalStepList>

			<div class="pt-1">
				<FileUploadField
					label="Upload a contacts CSV"
					description="Any CSV with people, companies, emails, or profile links"
					accept={contactCsvAccept}
					disabled={parsing}
					selectedFile={selectedContactCsvFile}
					errorText={uploadErrorText}
					onFileSelected={selectContactCsvFile}
				/>
				{#if activeContactsImport}
					<p class="mt-2 text-[0.68rem] leading-relaxed text-stone-500">
						{activeContactsImport.contacts.length} contacts ready from {activeContactsImport.fileName}
					</p>
				{/if}
			</div>
		</div>

		<TallModalCallout text="You aren't sharing anything sensitive. LinkedIn contacts are public and available to anyone who is connected to you" />
	</div>

	{#snippet footer()}
		<Button variant="secondary" onclick={onClose}>Cancel</Button>
		<Button disabled={parsing || !activeContactsImport} onclick={addContacts}>
			{parsing ? 'Reading...' : 'Add contacts'}
		</Button>
	{/snippet}
</FullHeightModalShell>
