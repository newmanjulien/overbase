import {
	applyWhitespaceFinderInitialAnswer,
	createWhitespaceFinderInitialDraft,
	createWhitespaceFinderInitialQuestion,
	streamWhitespaceFinderRefinementTurn
} from './engine';
import { whitespaceFinderCatalog } from './catalog';
import type { EmailAppDefinition } from './types';

export { whitespaceFinderCatalog } from './catalog';
export type * from './types';

export const whitespaceFinderApp = {
	...whitespaceFinderCatalog,
	createInitialQuestion: createWhitespaceFinderInitialQuestion,
	createInitialDraft: createWhitespaceFinderInitialDraft,
	applyInitialAnswer: applyWhitespaceFinderInitialAnswer,
	streamRefinementTurn: streamWhitespaceFinderRefinementTurn
} satisfies EmailAppDefinition;
