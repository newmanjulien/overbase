import { clientUpdateBlueprint } from './client-update';
import { dealFollowUpBlueprint } from './deal-follow-up';
import { implementationPlanBlueprint } from './implementation-plan';

export const blueprintEntries = [
	clientUpdateBlueprint,
	dealFollowUpBlueprint,
	implementationPlanBlueprint
] as const;
