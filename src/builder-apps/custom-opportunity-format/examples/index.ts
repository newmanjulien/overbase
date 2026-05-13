import { clientFollowUpExamples } from './client-follow-up';
import { marketSignalExamples } from './market-signal';
import { partnerCollaborationExamples } from './partner-collaboration';
import { pipelineRiskExamples } from './pipeline-risk';
import { teamOperationsExamples } from './team-operations';

export type { CustomEmailExample, CustomEmailExamples } from './types';
export * from './client-follow-up';
export * from './market-signal';
export * from './partner-collaboration';
export * from './pipeline-risk';
export * from './team-operations';

export const customEmailExamples = [
	clientFollowUpExamples,
	pipelineRiskExamples,
	marketSignalExamples,
	partnerCollaborationExamples,
	teamOperationsExamples
];

export function listCustomEmailExamples() {
	return [...customEmailExamples];
}

export function getCustomEmailExamples(slug: string) {
	return customEmailExamples.find((examples) => examples.slug === slug) ?? null;
}

export function listCustomEmailDraftExamples(examplesSlug: string) {
	return getCustomEmailExamples(examplesSlug)?.examples ?? [];
}
