<script lang="ts">
	import { ListFilter, Plus, Trash2 } from 'lucide-svelte';
	import { Button, IconButton, InfoBar, InfoBarAction } from '$lib/components/ui';
	import LinkDataSourcesModal from './LinkDataSourcesModal.svelte';
	import type { NotificationRule } from './notification-detail-types';

	type Props = {
		rules: NotificationRule[];
		canSave: boolean;
		onRulesChange: (rules: NotificationRule[]) => void;
		onSave: () => void;
		onGiveEmailFeedback?: () => void;
	};

	let { rules, canSave, onRulesChange, onSave, onGiveEmailFeedback }: Props = $props();
	let linkDataSourcesModalOpen = $state(false);

	function openLinkDataSourcesModal() {
		linkDataSourcesModalOpen = true;
	}

	function closeLinkDataSourcesModal() {
		linkDataSourcesModalOpen = false;
	}

	function updateRule(ruleId: string, patch: Partial<NotificationRule>) {
		onRulesChange(rules.map((rule) => (rule.id === ruleId ? { ...rule, ...patch } : rule)));
	}

	function removeRule(ruleId: string) {
		onRulesChange(rules.filter((rule) => rule.id !== ruleId));
	}

	function addRule() {
		onRulesChange([
			...rules,
			{
				id: `custom-${crypto.randomUUID()}`,
				text: ''
			}
		]);
	}
</script>

<aside class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-zinc-50/50 text-zinc-950">
	<div class="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 md:px-5">
		<div class="mb-3 flex items-center justify-between gap-3">
			<p class="text-[0.72rem] font-medium text-zinc-950">Rules for this notification</p>
			<Button variant="secondary" class="h-7 px-2.5 text-[0.68rem]" onclick={addRule}>
				{#snippet leading()}
					<Plus class="size-3.5" />
				{/snippet}
				Add rule
			</Button>
		</div>

		{#if rules.length > 0}
			<div class="space-y-3">
				<div class="space-y-3.5">
					{#each rules as rule (rule.id)}
						<section class="overflow-hidden rounded-sm border border-zinc-200/60 bg-white">
							<div class="px-3 py-3">
								<div class="flex items-start gap-2">
									<div class="min-w-0 flex-1">
										<textarea
											value={rule.text}
											aria-label="Rule"
											placeholder="Explain how this notification should behave"
											class="min-h-14 w-full resize-y border-0 bg-transparent p-0 text-[0.74rem] leading-[1.45] text-zinc-900 outline-none placeholder:text-zinc-400"
											oninput={(event) => updateRule(rule.id, { text: event.currentTarget.value })}
										></textarea>
									</div>

									<IconButton
										aria-label="Remove rule"
										variant="ghost"
										class="size-6 shrink-0 text-zinc-400 hover:bg-red-50 hover:text-red-600"
										onclick={() => removeRule(rule.id)}
									>
										<Trash2 class="size-3" />
									</IconButton>
								</div>
							</div>
							<div class="flex items-center justify-end border-t border-zinc-100 bg-zinc-50/70 px-3 py-2">
								<Button
									variant="secondary"
									class="inline-flex h-7 items-center justify-center rounded-sm border border-zinc-200 bg-white px-2.5 text-[0.7rem] font-medium text-zinc-800 transition-colors hover:bg-zinc-50 hover:text-zinc-950"
									onclick={openLinkDataSourcesModal}
								>
									Link data sources
								</Button>
							</div>
						</section>
					{/each}
				</div>

				<InfoBar label="Next steps:">
					Make these rules as precise and detailed as possible, you can also train the AI by
					{#if onGiveEmailFeedback}
						<InfoBarAction onclick={onGiveEmailFeedback}>
							giving feedback on specific emails
						</InfoBarAction>
					{:else}
						giving feedback on specific emails
					{/if}
				</InfoBar>
			</div>
		{:else}
			<div class="flex min-h-60 flex-1 items-center justify-center px-3 py-8">
				<div class="flex max-w-52 flex-col items-center text-center">
					<ListFilter aria-hidden="true" class="mb-4 size-5 text-zinc-950" />

					<h2 class="text-[0.78rem] leading-tight font-medium text-zinc-950">No rules yet</h2>

					<p class="mt-2 text-[0.67rem] leading-relaxed text-zinc-600">
						Give details about how this notification should behave, when it should fire and what data sources it should use
					</p>
				</div>
			</div>
		{/if}
	</div>

	<div class="shrink-0 border-t border-zinc-100 bg-white px-4 py-3 md:px-5">
		<div class="flex items-center justify-end">
			<Button
				variant="secondary"
				class="px-3 text-[0.74rem] text-zinc-800"
				disabled={!canSave}
				onclick={onSave}
			>
				Save changes
			</Button>
		</div>
	</div>
</aside>

<LinkDataSourcesModal open={linkDataSourcesModalOpen} onClose={closeLinkDataSourcesModal} />
