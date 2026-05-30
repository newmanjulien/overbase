import { clientUpdateBuilder } from './client-update';
import { dealFollowUpBuilder } from './deal-follow-up';
import { implementationPlanBuilder } from './implementation-plan';

export const builderEntries = [
	clientUpdateBuilder,
	dealFollowUpBuilder,
	implementationPlanBuilder
] as const;
