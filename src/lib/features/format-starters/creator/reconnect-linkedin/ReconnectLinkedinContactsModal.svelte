<script lang="ts">
	import {
		Button,
		FileUploadField,
		FullHeightModalShell,
		TallModalStepList,
		inlineLinkClass
	} from '$lib/ui';
	import {
		linkedinContactsCsvAccept,
		readLinkedinContactsCsvFile,
		type ContactImport
	} from '$lib/features/external-data/linkedin-contacts-upload';

	type Props = {
		open: boolean;
		contactsImport: ContactImport | null;
		submitting?: boolean;
		onClose: () => void;
		onContactsImported: (contactsImport: ContactImport) => void | Promise<void>;
	};

	let {
		open,
		contactsImport,
		submitting = false,
		onClose,
		onContactsImported
	}: Props = $props();
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
		selectedContactCsvFile = file;
		uploadErrorText = null;
		parsing = true;

		try {
			parsedContactsImport = await readLinkedinContactsCsvFile(file);
		} catch (error) {
			parsedContactsImport = null;
			uploadErrorText =
				error instanceof Error ? error.message : 'Could not read this CSV.';
		} finally {
			parsing = false;
		}
	}

	async function addContacts() {
		if (submitting) {
			return;
		}

		const contactsToImport = activeContactsImport;

		if (!contactsToImport) {
			uploadErrorText = 'Upload a contacts CSV first.';
			return;
		}

		try {
			await onContactsImported(contactsToImport);
		} catch (error) {
			uploadErrorText =
				error instanceof Error ? error.message : 'Could not add LinkedIn contacts.';
		}
	}
</script>

<FullHeightModalShell
	{open}
	title="Your personal LinkedIn contacts"
	subtitle="Add your personal LinkedIn contacts to try this email format"
	placement="right"
	{onClose}
>
	<div class="flex min-h-full flex-col justify-between gap-8 pt-1">
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
		</div>

		<div>
			<FileUploadField
				label="Upload your LinkedIn export"
				description="Upload the Connections.csv file provided by LinkedIn"
				accept={linkedinContactsCsvAccept}
				disabled={parsing || submitting}
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

	{#snippet footer()}
		<Button variant="secondary" disabled={submitting} onclick={onClose}>Cancel</Button>
		<Button disabled={parsing || submitting || !activeContactsImport} onclick={addContacts}>
			{parsing ? 'Reading...' : submitting ? 'Adding...' : 'Add contacts'}
		</Button>
	{/snippet}
</FullHeightModalShell>
