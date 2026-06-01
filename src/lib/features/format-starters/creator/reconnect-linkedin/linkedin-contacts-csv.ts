export type ContactImport = {
	fileName: string;
	contacts: Contact[];
};

export type Contact = {
	firstName: string;
	lastName: string;
	fullName: string;
	company: string;
	position: string;
	profileUrl: string;
	email: string;
	connectedOn: string;
	sourceRowNumber: number;
};

export type LinkedinContactImport = ContactImport;
export type LinkedinContact = Contact;

const CONTACT_IMPORT_LIMIT = 5_000;

const contactHeaderAliases = {
	firstName: ['First Name', 'Given Name'],
	lastName: ['Last Name', 'Surname', 'Family Name'],
	fullName: ['Full Name', 'Name', 'Contact Name', 'Person', 'Person Name', 'Client'],
	company: ['Company', 'Company Name', 'Organization', 'Organisation', 'Employer', 'Account', 'Firm'],
	position: ['Position', 'Title', 'Job Title', 'Role'],
	profileUrl: ['URL', 'Profile URL', 'LinkedIn URL', 'LinkedIn', 'LinkedIn Profile', 'Profile', 'Website'],
	email: ['Email Address', 'Email', 'E-mail', 'Mail'],
	connectedOn: ['Connected On', 'Connected', 'Date Connected']
} as const;

const normalizedContactHeaderAliases = Object.entries(contactHeaderAliases).map(
	([fieldName, aliases]) =>
		[
			fieldName,
			new Set(aliases.map((alias) => normalizeHeader(alias)))
		] as const
);

function normalizeHeader(value: string) {
	return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function getCell(row: string[], headerIndexes: Map<string, number>, ...headerNames: string[]) {
	for (const headerName of headerNames) {
		const index = headerIndexes.get(normalizeHeader(headerName));

		if (index !== undefined) {
			return row[index]?.trim() ?? '';
		}
	}

	return '';
}

function getAliasedCell(
	row: string[],
	headerIndexes: Map<string, number>,
	fieldName: keyof typeof contactHeaderAliases
) {
	return getCell(row, headerIndexes, ...contactHeaderAliases[fieldName]);
}

function parseCsvRows(input: string) {
	const rows: string[][] = [];
	let row: string[] = [];
	let cell = '';
	let quoted = false;

	for (let index = 0; index < input.length; index += 1) {
		const character = input[index];
		const nextCharacter = input[index + 1];

		if (quoted) {
			if (character === '"' && nextCharacter === '"') {
				cell += '"';
				index += 1;
			} else if (character === '"') {
				quoted = false;
			} else {
				cell += character;
			}
			continue;
		}

		if (character === '"') {
			quoted = true;
		} else if (character === ',') {
			row.push(cell);
			cell = '';
		} else if (character === '\n') {
			row.push(cell);
			rows.push(row);
			row = [];
			cell = '';
		} else if (character !== '\r') {
			cell += character;
		}
	}

	row.push(cell);
	rows.push(row);

	return rows.filter((csvRow) => csvRow.some((value) => value.trim()));
}

function getContactHeaderFields(row: string[]) {
	const headers = new Set(row.map(normalizeHeader));
	const fields = new Set<keyof typeof contactHeaderAliases>();

	for (const [fieldName, aliases] of normalizedContactHeaderAliases) {
		for (const header of headers) {
			if (aliases.has(header)) {
				fields.add(fieldName as keyof typeof contactHeaderAliases);
				break;
			}
		}
	}

	return fields;
}

function findHeaderRowIndex(rows: string[][]) {
	const headerRowIndex = rows.findIndex((row) => {
		const fields = getContactHeaderFields(row);
		const hasIdentityField =
			fields.has('firstName') ||
			fields.has('lastName') ||
			fields.has('fullName') ||
			fields.has('email') ||
			fields.has('profileUrl');

		return fields.size >= 2 && hasIdentityField;
	});

	return headerRowIndex >= 0 ? headerRowIndex : null;
}

function toHeaderIndexes(headerRow: string[]) {
	return new Map(headerRow.map((header, index) => [normalizeHeader(header), index]));
}

function toContact(row: string[], headerIndexes: Map<string, number>, sourceRowNumber: number) {
	const firstName = getAliasedCell(row, headerIndexes, 'firstName');
	const lastName = getAliasedCell(row, headerIndexes, 'lastName');
	const explicitFullName = getAliasedCell(row, headerIndexes, 'fullName');
	const fallbackFullName = row.find((value) => value.trim())?.trim() ?? '';
	const fullName =
		explicitFullName || [firstName, lastName].filter(Boolean).join(' ') || fallbackFullName;
	const profileUrl = getAliasedCell(row, headerIndexes, 'profileUrl');
	const email = getAliasedCell(row, headerIndexes, 'email');

	if (!fullName && !profileUrl && !email) {
		return null;
	}

	return {
		firstName,
		lastName,
		fullName,
		company: getAliasedCell(row, headerIndexes, 'company'),
		position: getAliasedCell(row, headerIndexes, 'position'),
		profileUrl,
		email,
		connectedOn: getAliasedCell(row, headerIndexes, 'connectedOn'),
		sourceRowNumber
	};
}

export function parseContactCsv(fileName: string, csvText: string): ContactImport {
	const rows = parseCsvRows(csvText);
	const headerRowIndex = findHeaderRowIndex(rows);

	const headerIndexes =
		headerRowIndex === null ? new Map<string, number>() : toHeaderIndexes(rows[headerRowIndex]);
	const contactRows = headerRowIndex === null ? rows : rows.slice(headerRowIndex + 1);
	const firstContactRowNumber = headerRowIndex === null ? 1 : headerRowIndex + 2;
	const contacts = contactRows
		.map((row, rowIndex) => toContact(row, headerIndexes, firstContactRowNumber + rowIndex))
		.filter((contact): contact is LinkedinContact => contact !== null)
		.slice(0, CONTACT_IMPORT_LIMIT);

	if (contacts.length === 0) {
		throw new Error('No contacts were found in this CSV.');
	}

	return {
		fileName,
		contacts
	};
}

export const parseLinkedinContactsCsv = parseContactCsv;
