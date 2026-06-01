import { v } from 'convex/values';

export const externalDataSourceKind = v.literal('linkedinContacts');
export const externalDataSourceStatus = v.literal('ready');
export const externalDataSourceId = v.id('externalDataSources');

export const linkedinContactFields = {
	firstName: v.string(),
	lastName: v.string(),
	fullName: v.string(),
	company: v.string(),
	position: v.string(),
	profileUrl: v.string(),
	email: v.string(),
	connectedOn: v.string(),
	sourceRowNumber: v.number()
};

export const linkedinContactRow = v.object(linkedinContactFields);

export const linkedinContactsExternalDataImport = v.object({
	kind: v.literal('linkedinContacts'),
	fileName: v.string(),
	contacts: v.array(linkedinContactRow)
});

export const externalDataImport = v.union(linkedinContactsExternalDataImport, v.null());

export const deleteExternalDataSourceInput = {
	externalDataSourceId
};

export const replaceExternalDataSourceInput = {
	externalDataSourceId,
	externalDataImport: linkedinContactsExternalDataImport
};
