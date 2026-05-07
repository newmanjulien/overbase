import {
	createWhitespaceFinderInitialDraft,
	streamWhitespaceFinderRefinementTurn
} from './engine';
import { whitespaceFinderCatalog } from './catalog';
import type { EmailAppDefinition } from './types';

export { whitespaceFinderCatalog } from './catalog';
export type * from './types';

export const whitespaceFinderApp = {
	...whitespaceFinderCatalog,
	createInitialDraft: createWhitespaceFinderInitialDraft,
	streamRefinementTurn: streamWhitespaceFinderRefinementTurn
} satisfies EmailAppDefinition;
