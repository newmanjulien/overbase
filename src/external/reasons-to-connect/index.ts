import {
	applyReasonsToConnectInitialAnswer,
	createReasonsToConnectInitialDraft,
	createReasonsToConnectInitialQuestion,
	streamReasonsToConnectRefinementTurn
} from './engine';
import { reasonsToConnectCatalog } from './catalog';
import type { EmailAppDefinition } from './types';

export { reasonsToConnectCatalog } from './catalog';
export type * from './types';

export const reasonsToConnectApp = {
	...reasonsToConnectCatalog,
	createInitialQuestion: createReasonsToConnectInitialQuestion,
	createInitialDraft: createReasonsToConnectInitialDraft,
	applyInitialAnswer: applyReasonsToConnectInitialAnswer,
	streamRefinementTurn: streamReasonsToConnectRefinementTurn
} satisfies EmailAppDefinition;
