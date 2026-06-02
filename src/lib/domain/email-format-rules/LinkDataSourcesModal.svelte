<script lang="ts">
	import type { Id } from '$convex/_generated/dataModel';
	import { APP_LINKS } from '$lib/app/app-links';
	import {
		Button,
		FullHeightModalShell,
		TallModalCallout,
		TallModalStepList
	} from '$lib/ui';

	type Props = {
		open: boolean;
		linkedinContactsSources?: {
			id: Id<'externalDataSources'>;
			name: string;
			sourceFileName: string;
		}[];
		linkingLinkedinContactsSourceId?: Id<'externalDataSources'> | null;
		linkError?: string | null;
		onClose: () => void;
		onLinkLinkedinContactsSource?: (
			externalDataSourceId: Id<'externalDataSources'>
		) => void | Promise<void>;
	};

	let {
		open,
		linkedinContactsSources = [],
		linkingLinkedinContactsSourceId = null,
		linkError = null,
		onClose,
		onLinkLinkedinContactsSource
	}: Props = $props();
	const canAssignLinkedinContacts = $derived(Boolean(onLinkLinkedinContactsSource));

	const linkDataSourceSteps = [
		{
			title: 'Set up internal or external data sources',
			description:
				'Connect internal data sources, external data sources or partner data'
		},
		{
			title: 'Link to your rule',
			description:
				'Choose which internal or external data sources each rule in your email format should use'
		},
		{
			title: 'Receive sent emails',
			description:
				'Start receiving custom revenue emails backed by the best data'
		}
	];
</script>

<FullHeightModalShell
	{open}
	title="Link data sources"
	subtitle="Choose internal or external data sources for your rules"
	placement="right"
	{onClose}
>
	<div class="flex min-h-full flex-col justify-between gap-6 pt-1">
		<div class="space-y-5">
			<p class="text-[0.72rem] leading-relaxed text-stone-600">
				You will tell us which internal or external data sources to use to power each of your rules. But first, you need to set them up
			</p>

			{#if canAssignLinkedinContacts}
				<div class="space-y-3">
					<div>
						<p class="text-[0.72rem] font-medium text-stone-950">LinkedIn contacts</p>
						<p class="mt-1 text-[0.68rem] leading-relaxed text-stone-600">
							Assign a LinkedIn contacts source to this rule.
						</p>
					</div>

					{#if linkedinContactsSources.length > 0}
						<div class="space-y-2">
							{#each linkedinContactsSources as source (source.id)}
								<div class="flex items-center justify-between gap-3 rounded-sm border border-stone-200/70 bg-white px-3 py-2">
									<div class="min-w-0">
										<p class="truncate text-[0.72rem] font-medium text-stone-950">
											{source.name}
										</p>
										<p class="mt-0.5 truncate text-[0.66rem] text-stone-500">
											{source.sourceFileName}
										</p>
									</div>
									<Button
										variant="secondary"
										class="h-7 px-2.5 text-[0.68rem]"
										disabled={Boolean(linkingLinkedinContactsSourceId)}
										onclick={() => onLinkLinkedinContactsSource?.(source.id)}
									>
										{linkingLinkedinContactsSourceId === source.id ? 'Assigning...' : 'Assign'}
									</Button>
								</div>
							{/each}
						</div>
					{:else}
						<div class="rounded-sm border border-dashed border-stone-200 bg-stone-50/70 px-3 py-4">
							<p class="text-[0.7rem] leading-relaxed text-stone-600">
								Add LinkedIn contacts in external data sources first, then assign them to this rule.
							</p>
						</div>
					{/if}

					{#if linkError}
						<p class="text-[0.68rem] leading-relaxed text-red-600">{linkError}</p>
					{/if}
				</div>
			{:else}
				<TallModalStepList steps={linkDataSourceSteps} />
			{/if}
		</div>

		<TallModalCallout
			text="Link internal or external data sources to this rule and email format"
		/>
	</div>

	{#snippet footer()}
		<Button variant="secondary" onclick={onClose}>Cancel</Button>
		<Button href={canAssignLinkedinContacts ? APP_LINKS.externalData.pathname : APP_LINKS.internalData.pathname}>
			{canAssignLinkedinContacts ? 'Add external data' : 'Add internal data'}
		</Button>
	{/snippet}
</FullHeightModalShell>
