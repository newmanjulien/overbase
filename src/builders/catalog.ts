import type { BuilderAppRegistryEntry } from '../builder-apps/registry';
import type { BuilderCategory } from './categories';

export type BuilderCatalogEntry = BuilderAppRegistryEntry & {
	kind: 'externalApp';
};

export type BuilderCatalogHomeData = {
	categories: BuilderCategory[];
	apps: BuilderCatalogEntry[];
};
