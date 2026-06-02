import type {
	FormatStarterArtwork,
	FormatEmailContent,
	FormatStarterSelection,
	FormatVariableDefinition
} from '$lib/features/format-starters/domain';
import type {
	EmailFormatDataMode,
	EmailFormatInlineTextContent
} from '$shared/email-format-definitions';
import type { DataSourceId } from '$lib/domain/data-sources';
import type { FormatStarterIndustryTagId } from './industry-tags';

export type FormatStartingPoint = {
	id: string;
	label: string;
	variantSlug: string;
	emailContent: FormatEmailContent;
};

export type FormatStarterSampleEmail = {
	subject: string;
	paragraphs: readonly [string, ...string[]];
};

type FormatStarterBase = {
	slug: string;
	formatDefinitionSlug: string;
	mode: EmailFormatDataMode;
	title: string;
	description: string;
	dataSourceIds: readonly DataSourceId[];
	industryTags: readonly FormatStarterIndustryTagId[];
	sampleEmail: FormatStarterSampleEmail;
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
	'mode' | 'slug' | 'title' | 'description' | 'dataSourceIds' | 'industryTags' | 'sampleEmail'
>;
