<script lang="ts">
	import { useCurrentWorkspaceContext } from '$lib/app/current-workspace.svelte';
	import PageShell from '$lib/components/layout/PageShell.svelte';
	import SettingsAvatarCard from './SettingsAvatarCard.svelte';
	import SettingsDangerCard from './SettingsDangerCard.svelte';
	import SettingsTextFieldCard from './SettingsTextFieldCard.svelte';

	const currentWorkspace = useCurrentWorkspaceContext();
	const userName = $derived(currentWorkspace.user.displayName || currentWorkspace.user.email);
	const userAvatar = $derived(currentWorkspace.user.avatarUrl ?? '');
	const workspaceName = $derived(currentWorkspace.workspace.name);
</script>

<PageShell class="bg-white px-3 py-4 md:px-6 md:py-6">
	<div class="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-10 md:gap-7 md:pb-16">
		<SettingsTextFieldCard
			title="Name"
			description="This is your visible name in Overbase."
			fieldId="settings-user-name"
			label="User name"
			value={userName}
			footerText="Use 32 characters at maximum."
		/>

		<SettingsTextFieldCard
			title="Company Name"
			description="This is your company's visible name in Overbase."
			fieldId="settings-company-name"
			label="Company name"
			value={workspaceName}
			footerText="Use the company or department name your team recognizes."
		/>

		<SettingsAvatarCard
			title="User Avatar"
			description={[
				"This is your personal avatar.",
				"Upload controls are presentational until account management is connected."
			]}
			footerText="An avatar is optional but helps teammates recognize you."
			person={{ name: userName, avatar: userAvatar }}
			ariaLabel="Upload user avatar"
		/>

		<SettingsAvatarCard
			title="Company Avatar"
			description={[
				"This is your company's avatar.",
				"Company avatar storage is not connected yet."
			]}
			footerText="An avatar is optional but strongly recommended."
			person={{ name: workspaceName, avatar: '' }}
			ariaLabel="Upload company avatar"
		/>

		<SettingsDangerCard />
	</div>
</PageShell>
