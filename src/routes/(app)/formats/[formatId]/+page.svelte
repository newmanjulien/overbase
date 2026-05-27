<script lang="ts">
	import { page } from '$app/state';
	import type { Id } from '$convex/_generated/dataModel';
	import { OpportunityFormatDetailPage } from '$lib/features/opportunity-formats/detail';

	const opportunityFormatId = $derived(page.params.formatId as Id<'opportunityFormats'>);
</script>

<OpportunityFormatDetailPage {opportunityFormatId} />
