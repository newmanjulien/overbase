import {
	createCrossSellingInitialDraft,
	streamCrossSellingRefinementTurn
} from './engine';
import { crossSellingCatalog } from './catalog';
import type { EmailAppDefinition } from './types';

export { crossSellingCatalog } from './catalog';
export type * from './types';

export const crossSellingApp = {
	...crossSellingCatalog,
	createInitialDraft: createCrossSellingInitialDraft,
	streamRefinementTurn: streamCrossSellingRefinementTurn
} satisfies EmailAppDefinition;
