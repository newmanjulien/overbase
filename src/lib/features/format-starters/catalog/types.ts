import type {
	FormatStarterArtwork,
	FormatEmailContent,
	FormatStarterSelection,
	FormatVariableDefinition
} from '$lib/features/format-starters/domain';
import type {
	EmailFormatRule,
	EmailFormatRuleDataSourceAction
} from '$lib/domain/email-format-rules';
import type { InlineTextContent } from '$lib/domain/inline-text';

export type FormatStarterRuleDataSourceAction = EmailFormatRuleDataSourceAction;
export type FormatStarterRuleDataSourceModal = 'default' | 'reconnect-linkedin';

export type FormatStartingPoint = {
	id: string;
	label: string;
	emailContent: FormatEmailContent;
	ruleDataSourceAction?: FormatStarterRuleDataSourceAction;
};

type FormatStarterBase = {
	slug: string;
	title: string;
	description: string;
	details: {
		paragraphs: readonly [string, ...string[]];
	};
	artwork: FormatStarterArtwork;
	variables: readonly FormatVariableDefinition[];
	startingPoints: readonly FormatStartingPoint[];
	startingPointSelection: FormatStarterSelection;
	showInGallery: boolean;
	modeSortOrder: number;
	status: 'active';
};

export type InternalDataFormatStarter = FormatStarterBase & {
	mode: 'internal-data';
};

export type PublicDataFormatStarter = FormatStarterBase & {
	mode: 'public-data';
	initialRules: readonly EmailFormatRule[];
	ruleDataSourceAction: FormatStarterRuleDataSourceAction;
	ruleDataSourceModal?: FormatStarterRuleDataSourceModal;
	ruleInfoCard: {
		label: string;
		content: InlineTextContent;
	};
};

export type FormatStarter =
	| InternalDataFormatStarter
	| PublicDataFormatStarter;

export type FormatStarterGalleryEntry = Pick<
	FormatStarter,
	'mode' | 'slug' | 'title' | 'description' | 'artwork'
>;
