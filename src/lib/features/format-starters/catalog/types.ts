import type {
	FormatEmailContent,
	FormatStarterSelection,
	FormatVariableDefinition
} from '$lib/features/format-starters/domain';
import type { EmailFormatDataMode } from '$domain/email-formats';
import type { DataSourceId } from '$lib/features/format-starters/data-sources';
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

export type FormatStarterPresentation = {
	title: string;
	description: string;
};

export type FormatStarterBase = {
	slug: string;
	formatDefinitionSlug: string;
	mode: EmailFormatDataMode;
	defaultPresentation: FormatStarterPresentation;
	dataSourceIds: readonly DataSourceId[];
	industryTags: readonly FormatStarterIndustryTagId[];
	sampleEmail: FormatStarterSampleEmail;
	details: {
		paragraphs: readonly [string, ...string[]];
	};
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
};

export type FormatStarter =
	| InternalDataFormatStarter
	| PublicDataFormatStarter;

export type FormatStarterCardEntry = Pick<
	FormatStarter,
	'mode' | 'slug' | 'dataSourceIds' | 'industryTags' | 'sampleEmail'
> &
	FormatStarterPresentation;

export type FormatStarterGalleryEntry = FormatStarterCardEntry;
