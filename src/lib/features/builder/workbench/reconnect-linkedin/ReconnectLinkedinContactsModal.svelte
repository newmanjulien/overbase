<script lang="ts">
	import { APP_LINKS } from '$lib/app/app-links';
	import {
		Button,
		FileUploadField,
		FullHeightModalShell,
		TallModalCallout,
		TallModalStepList,
		inlineLinkClass
	} from '$lib/ui';

	type Props = {
		open: boolean;
		onClose: () => void;
	};

	let { open, onClose }: Props = $props();
	let selectedLinkedinExportFile = $state<File | null>(null);
	let uploadErrorText = $state<string | null>(null);

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
	const linkedinExportAccept = '.csv,.zip';
	const linkedinExportMimeTypes = new Set([
		'text/csv',
		'application/csv',
		'application/vnd.ms-excel',
		'application/zip',
		'application/x-zip-compressed',
		'application/octet-stream'
	]);

	function getFileExtension(fileName: string) {
		return fileName.split('.').pop()?.toLowerCase() ?? '';
	}

	function isLinkedinExportFile(file: File) {
		const extension = getFileExtension(file.name);
		const hasAllowedExtension = extension === 'csv' || extension === 'zip';
		const hasAllowedType = !file.type || linkedinExportMimeTypes.has(file.type);

		return hasAllowedExtension && hasAllowedType;
	}

	function selectLinkedinExportFile(file: File) {
		if (!isLinkedinExportFile(file)) {
			uploadErrorText = 'Upload a CSV or ZIP file from LinkedIn.';
			return;
		}

		selectedLinkedinExportFile = file;
		uploadErrorText = null;
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
					label="Upload your LinkedIn export"
					description="CSV or ZIP export from LinkedIn"
					accept={linkedinExportAccept}
					selectedFile={selectedLinkedinExportFile}
					errorText={uploadErrorText}
					onFileSelected={selectLinkedinExportFile}
				/>
			</div>
		</div>

		<TallModalCallout text="You aren't sharing anything sensitive. LinkedIn contacts are public and available to anyone who is connected to you" />
	</div>

	{#snippet footer()}
		<Button variant="secondary" onclick={onClose}>Cancel</Button>
		<Button href={APP_LINKS.dataSources.pathname}>Add contacts</Button>
	{/snippet}
</FullHeightModalShell>
