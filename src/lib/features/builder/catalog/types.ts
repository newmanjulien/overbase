import type {
	BuilderArtwork,
	BuilderEmailContent,
	BuilderStartingPointSelection,
	BuilderVariableDefinition
} from '$lib/features/builder/domain';
import type {
	EmailFormatRule,
	EmailFormatRuleDataSourceAction
} from '$lib/domain/email-format-rules';
import type { InlineTextContent } from '$lib/domain/inline-text';

export type BuilderRuleDataSourceAction = EmailFormatRuleDataSourceAction;
export type BuilderRuleDataSourceModal = 'default' | 'reconnect-linkedin';

export type BuilderStartingPoint = {
	id: string;
	label: string;
	emailContent: BuilderEmailContent;
	ruleDataSourceAction?: BuilderRuleDataSourceAction;
};

type BuilderBaseRegistryEntry = {
	slug: string;
	title: string;
	description: string;
	details: {
		paragraphs: readonly [string, ...string[]];
	};
	artwork: BuilderArtwork;
	variables: readonly BuilderVariableDefinition[];
	startingPoints: readonly BuilderStartingPoint[];
	startingPointSelection: BuilderStartingPointSelection;
	showInGallery: boolean;
	modeSortOrder: number;
	status: 'active';
};

export type InternalDataBuilderRegistryEntry = BuilderBaseRegistryEntry & {
	mode: 'internal-data';
};

export type PublicDataBuilderRegistryEntry = BuilderBaseRegistryEntry & {
	mode: 'public-data';
	initialRules: readonly EmailFormatRule[];
	ruleDataSourceAction: BuilderRuleDataSourceAction;
	ruleDataSourceModal?: BuilderRuleDataSourceModal;
	ruleInfoCard: {
		label: string;
		content: InlineTextContent;
	};
};

export type BuilderRegistryEntry =
	| InternalDataBuilderRegistryEntry
	| PublicDataBuilderRegistryEntry;

export type BuilderGalleryEntry = Pick<
	BuilderRegistryEntry,
	'mode' | 'slug' | 'title' | 'description' | 'artwork'
>;
