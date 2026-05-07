import {
	createBringTheFirmInitialDraft,
	streamBringTheFirmRefinementTurn
} from './engine';
import { bringTheFirmCatalog } from './catalog';
import type { EmailAppDefinition } from './types';

export { bringTheFirmCatalog } from './catalog';
export type * from './types';

export const bringTheFirmApp = {
	...bringTheFirmCatalog,
	createInitialDraft: createBringTheFirmInitialDraft,
	streamRefinementTurn: streamBringTheFirmRefinementTurn
} satisfies EmailAppDefinition;
