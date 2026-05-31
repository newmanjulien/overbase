<script lang="ts">
	import {
		EmailFormatRulePanel,
		LinkDataSourcesModal
	} from '$lib/domain/email-format-rules';
	import type { EmailFormatRule } from './email-format-detail-types';

	type Props = {
		rules: EmailFormatRule[];
		canSave: boolean;
		onRulesChange: (rules: EmailFormatRule[]) => void;
		onSave: () => void;
		onGiveEmailFeedback?: () => void;
	};

	let { rules, canSave, onRulesChange, onSave, onGiveEmailFeedback }: Props = $props();
	let linkDataSourcesModalOpen = $state(false);
</script>

<EmailFormatRulePanel
	{rules}
	{canSave}
	{onRulesChange}
	{onSave}
	{onGiveEmailFeedback}
	onLinkDataSources={() => (linkDataSourcesModalOpen = true)}
	showFeedbackHint
/>

<LinkDataSourcesModal open={linkDataSourcesModalOpen} onClose={() => (linkDataSourcesModalOpen = false)} />
