<script lang="ts">
	import { api } from '$convex/_generated/api';
	import type { Id } from '$convex/_generated/dataModel';
	import {
		createDefaultEmailDraft,
		type EmailDraft
	} from '$convex/builderEmailContract';
	import { useQuery } from 'convex-svelte';

	type Props = {
		builderSessionId: Id<'builderSessions'> | null;
	};

	let { builderSessionId }: Props = $props();

	const artifactQuery = useQuery(api.builderSessions.getSessionArtifact, () =>
		builderSessionId ? { builderSessionId } : 'skip'
	);
	const artifact = $derived(artifactQuery.data ?? null);
	const draft = $derived((artifact?.emailDraft as EmailDraft | undefined) ?? createDefaultEmailDraft());
	const subject = $derived(draft.subject || 'Subject line will appear here');
	const previewText = $derived(draft.previewText || 'Preview text will appear here.');
	const status = $derived(artifact?.status ?? 'collecting');
	const previewStyle = $derived(
		[
			`--email-accent: ${getSafeColor(draft.theme.accentColor, '#18181b')}`,
			`--email-bg: ${getSafeColor(draft.theme.backgroundColor, '#f4f4f5')}`,
			`--email-surface: ${getSafeColor(draft.theme.surfaceColor, '#ffffff')}`,
			`--email-text: ${getSafeColor(draft.theme.textColor, '#18181b')}`
		].join('; ')
	);

	function getSafeColor(value: string, fallback: string) {
		return /^#[0-9a-fA-F]{3,8}$/.test(value.trim()) ? value.trim() : fallback;
	}
</script>

<aside class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-zinc-50 text-zinc-950">
	<div class="flex h-11 shrink-0 items-center border-b border-zinc-200/70 bg-white px-4">
		<div class="min-w-0">
			<p class="truncate text-[0.74rem] font-medium text-zinc-950">Email preview</p>
			<p class="truncate text-[0.66rem] text-zinc-500">
				{status === 'ready' ? 'Ready draft' : status === 'drafting' ? 'Drafting' : 'Collecting details'}
			</p>
		</div>
	</div>

	<div class="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-7 md:py-8">
		<div class="mx-auto w-full max-w-[640px]" style={previewStyle}>
			<div class="mb-4 rounded-sm border border-zinc-200 bg-white px-4 py-3 shadow-sm">
				<div class="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 text-[0.7rem] leading-relaxed">
					<span class="text-zinc-400">From</span>
					<span class="truncate text-zinc-700">Overbase</span>
					<span class="text-zinc-400">Subject</span>
					<span class="truncate font-medium text-zinc-950">{subject}</span>
					<span class="text-zinc-400">Preview</span>
					<span class="truncate text-zinc-600">{previewText}</span>
				</div>
			</div>

			<article
				class="overflow-hidden rounded-sm border border-zinc-200 bg-[var(--email-surface)] text-[var(--email-text)] shadow-sm"
			>
				<div class="bg-[var(--email-bg)] px-6 py-7">
					{#each draft.blocks as block (block.id)}
						{#if block.type === 'header'}
							<section class="border-b border-black/10 pb-6">
								<p class="text-[0.68rem] font-medium tracking-wide text-[var(--email-accent)] uppercase">
									{block.eyebrow}
								</p>
								<h2 class="mt-2 text-[1.45rem] leading-tight font-semibold tracking-normal text-[var(--email-text)]">
									{block.title}
								</h2>
								<p class="mt-3 text-[0.86rem] leading-relaxed text-zinc-600">{block.body}</p>
							</section>
						{:else if block.type === 'summary'}
							<section class="border-b border-black/10 py-5">
								<h3 class="text-[0.92rem] font-semibold text-[var(--email-text)]">{block.title}</h3>
								<p class="mt-2 text-[0.82rem] leading-relaxed text-zinc-600">{block.body}</p>
							</section>
						{:else if block.type === 'details'}
							<section class="border-b border-black/10 py-5">
								<h3 class="text-[0.92rem] font-semibold text-[var(--email-text)]">{block.title}</h3>
								<dl class="mt-3 divide-y divide-black/10">
									{#each block.items as item, itemIndex (`${item.label}:${itemIndex}`)}
										<div class="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 py-2.5 text-[0.78rem] leading-snug">
											<dt class="text-zinc-500">{item.label}</dt>
											<dd class="min-w-0 text-zinc-800">{item.value}</dd>
										</div>
									{/each}
								</dl>
							</section>
						{:else if block.type === 'table'}
							<section class="border-b border-black/10 py-5">
								<h3 class="text-[0.92rem] font-semibold text-[var(--email-text)]">{block.title}</h3>
								<div class="mt-3 overflow-hidden rounded-sm border border-black/10 bg-white">
									<table class="w-full border-collapse text-left text-[0.72rem]">
										<thead class="bg-zinc-50 text-zinc-500">
											<tr>
												{#each block.columns as column, columnIndex (`${column}:${columnIndex}`)}
													<th class="border-b border-black/10 px-3 py-2 font-medium">{column}</th>
												{/each}
											</tr>
										</thead>
										<tbody class="text-zinc-800">
											{#each block.rows as row, rowIndex (rowIndex)}
												<tr>
													{#each row as cell, cellIndex (cellIndex)}
														<td class="border-b border-black/5 px-3 py-2 align-top">{cell}</td>
													{/each}
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							</section>
						{:else if block.type === 'cta'}
							<section class="border-b border-black/10 py-5">
								<p class="text-[0.9rem] font-semibold text-[var(--email-text)]">{block.label}</p>
								<p class="mt-2 text-[0.8rem] leading-relaxed text-zinc-600">{block.description}</p>
								<div
									class="mt-4 inline-flex min-h-9 items-center rounded-sm bg-[var(--email-accent)] px-4 text-[0.76rem] font-medium text-white"
								>
									{block.buttonLabel}
								</div>
							</section>
						{:else if block.type === 'footer'}
							<footer class="pt-5 text-[0.7rem] leading-relaxed text-zinc-500">
								{block.body}
							</footer>
						{/if}
					{/each}
				</div>
			</article>
		</div>
	</div>
</aside>
