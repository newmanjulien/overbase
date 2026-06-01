import { reconnectLinkedinFormatStarter } from './reconnect-linkedin';
import { clientUpdateFormatStarter } from './client-update';
import { dealFollowUpFormatStarter } from './deal-follow-up';
import { implementationPlanFormatStarter } from './implementation-plan';

export const formatStarterEntries = [
	clientUpdateFormatStarter,
	dealFollowUpFormatStarter,
	implementationPlanFormatStarter,
	reconnectLinkedinFormatStarter
] as const;
