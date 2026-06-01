import type {
	FormatStarterArtwork,
	FormatEmailContent,
	FormatStarterSelection,
	FormatVariableDefinition
} from '$lib/features/format-starters/domain';
import type {
	EmailFormatDataMode,
	EmailFormatInlineTextContent,
	EmailFormatRule,
	EmailFormatRuleDataSourceAction
} from '$shared/email-format-definitions';

export type FormatStarterRuleDataSourceAction = EmailFormatRuleDataSourceAction;
export type FormatStarterRuleDataSourceModal = 'default' | 'reconnect-linkedin';
export type FormatStartingPointInitialRecipients = 'viewer' | 'none';

export type FormatStartingPoint = {
	id: string;
	label: string;
	initialRecipients: FormatStartingPointInitialRecipients;
	emailContent: FormatEmailContent;
	ruleDataSourceAction?: FormatStarterRuleDataSourceAction;
};

type FormatStarterBase = {
	slug: string;
	formatDefinitionSlug: string;
	mode: EmailFormatDataMode;
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
		content: EmailFormatInlineTextContent;
	};
};

export type FormatStarter =
	| InternalDataFormatStarter
	| PublicDataFormatStarter;

export type FormatStarterGalleryEntry = Pick<
	FormatStarter,
	'mode' | 'slug' | 'title' | 'description' | 'artwork'
>;
