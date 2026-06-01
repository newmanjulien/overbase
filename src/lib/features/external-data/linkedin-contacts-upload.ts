import { parseContactCsv, type ContactImport } from './linkedin-contacts-csv';

export type { ContactImport } from './linkedin-contacts-csv';

export const linkedinContactsCsvAccept = '.csv';

const csvMimeTypes = new Set([
	'text/csv',
	'application/csv',
	'application/vnd.ms-excel',
	'application/octet-stream'
]);

function getFileExtension(fileName: string) {
	return fileName.split('.').pop()?.toLowerCase() ?? '';
}

export function isLinkedinContactsCsvFile(file: File) {
	const extension = getFileExtension(file.name);
	const hasAllowedExtension = extension === 'csv';
	const hasAllowedType = !file.type || csvMimeTypes.has(file.type);

	return hasAllowedExtension && hasAllowedType;
}

export async function readLinkedinContactsCsvFile(file: File): Promise<ContactImport> {
	if (!isLinkedinContactsCsvFile(file)) {
		throw new Error('Upload a CSV file.');
	}

	return parseContactCsv(file.name, await file.text());
}
