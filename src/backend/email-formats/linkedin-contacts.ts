import type { Id } from '../../convex/_generated/dataModel';
import type { MutationCtx } from '../../convex/_generated/server';

const MAX_LINKEDIN_CONTACTS = 5_000;
const MAX_CONTACT_FIELD_LENGTH = 240;
const MAX_CONTACT_URL_LENGTH = 1_000;
const MAX_CONTACT_EMAIL_LENGTH = 320;
const MAX_SOURCE_FILE_NAME_LENGTH = 160;

export type LinkedinContactSource = {
	fileName: string;
	contacts: Array<{
		firstName: string;
		lastName: string;
		fullName: string;
		company: string;
		position: string;
		profileUrl: string;
		email: string;
		connectedOn: string;
		sourceRowNumber: number;
	}>;
} | null;

type NormalizedLinkedinContact = NonNullable<
	ReturnType<typeof normalizeLinkedinContact>
>;

export type NormalizedLinkedinContactsSource = {
	fileName: string;
	contacts: NormalizedLinkedinContact[];
	summary: {
		contactCount: number;
		sourceFileName: string;
		importedAt: number;
	};
};

function clampText(value: string, maxLength: number) {
	const normalized = value.trim();

	return normalized.length > maxLength ? normalized.slice(0, maxLength).trim() : normalized;
}

function normalizeLinkedinContact(contact: NonNullable<LinkedinContactSource>['contacts'][number]) {
	const firstName = clampText(contact.firstName, MAX_CONTACT_FIELD_LENGTH);
	const lastName = clampText(contact.lastName, MAX_CONTACT_FIELD_LENGTH);
	const fullName =
		clampText(contact.fullName, MAX_CONTACT_FIELD_LENGTH) ||
		clampText(`${firstName} ${lastName}`, MAX_CONTACT_FIELD_LENGTH);
	const profileUrl = clampText(contact.profileUrl, MAX_CONTACT_URL_LENGTH);
	const email = clampText(contact.email, MAX_CONTACT_EMAIL_LENGTH).toLowerCase();

	if (!fullName && !profileUrl && !email) {
		return null;
	}

	return {
		firstName,
		lastName,
		fullName,
		company: clampText(contact.company, MAX_CONTACT_FIELD_LENGTH),
		position: clampText(contact.position, MAX_CONTACT_FIELD_LENGTH),
		profileUrl,
		email,
		connectedOn: clampText(contact.connectedOn, MAX_CONTACT_FIELD_LENGTH),
		sourceRowNumber: Number.isFinite(contact.sourceRowNumber) ? contact.sourceRowNumber : 0
	};
}

export function normalizeLinkedinContactsSource(
	source: LinkedinContactSource,
	importedAt: number
): NormalizedLinkedinContactsSource | null {
	if (!source) {
		return null;
	}

	const fileName = clampText(source.fileName, MAX_SOURCE_FILE_NAME_LENGTH);

	if (!fileName) {
		return null;
	}

	const contacts = source.contacts
		.slice(0, MAX_LINKEDIN_CONTACTS)
		.map(normalizeLinkedinContact)
		.filter((contact): contact is NormalizedLinkedinContact => Boolean(contact));

	return contacts.length > 0
		? {
				fileName,
				contacts,
				summary: {
					contactCount: contacts.length,
					sourceFileName: fileName,
					importedAt
				}
			}
		: null;
}

export async function insertLinkedinContactsForEmailFormat(
	ctx: MutationCtx,
	args: {
		workspaceId: Id<'workspaces'>;
		emailFormatId: Id<'emailFormats'>;
		contactsSource: NormalizedLinkedinContactsSource | null;
		createdAt: number;
	}
) {
	for (const contact of args.contactsSource?.contacts ?? []) {
		await ctx.db.insert('emailFormatLinkedinContacts', {
			workspaceId: args.workspaceId,
			emailFormatId: args.emailFormatId,
			...contact,
			createdAt: args.createdAt
		});
	}
}
