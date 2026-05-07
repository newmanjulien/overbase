import {
	createReasonsToConnectInitialDraft,
	streamReasonsToConnectRefinementTurn
} from './engine';
import { reasonsToConnectCatalog } from './catalog';
import type { EmailAppDefinition } from './types';

export { reasonsToConnectCatalog } from './catalog';
export type * from './types';

export const reasonsToConnectApp = {
	...reasonsToConnectCatalog,
	createInitialDraft: createReasonsToConnectInitialDraft,
	streamRefinementTurn: streamReasonsToConnectRefinementTurn
} satisfies EmailAppDefinition;
