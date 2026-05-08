import {
	applyCrossSellingInitialAnswer,
	createCrossSellingInitialDraft,
	createCrossSellingInitialQuestion,
	streamCrossSellingRefinementTurn
} from './engine';
import { crossSellingCatalog } from './catalog';
import type { EmailAppDefinition } from './types';

export { crossSellingCatalog } from './catalog';
export type * from './types';

export const crossSellingApp = {
	...crossSellingCatalog,
	createInitialQuestion: createCrossSellingInitialQuestion,
	createInitialDraft: createCrossSellingInitialDraft,
	applyInitialAnswer: applyCrossSellingInitialAnswer,
	streamRefinementTurn: streamCrossSellingRefinementTurn
} satisfies EmailAppDefinition;
