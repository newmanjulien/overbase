import type { Doc, Id } from '../../convex/_generated/dataModel';
import type { MutationCtx } from '../../convex/_generated/server';
import type { ViewerWorkspace } from '../auth/viewer';

const MAX_LINKEDIN_CONTACTS = 5_000;
const MAX_CONTACT_FIELD_LENGTH = 240;
const MAX_CONTACT_URL_LENGTH = 1_000;
const MAX_CONTACT_EMAIL_LENGTH = 320;
const MAX_SOURCE_FILE_NAME_LENGTH = 160;

export type LinkedinContactsImport = {
	kind: 'linkedinContacts';
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

type NormalizedLinkedinContact = NonNullable<ReturnType<typeof normalizeLinkedinContact>>;

export type NormalizedLinkedinContactsSource = {
	kind: 'linkedinContacts';
	fileName: string;
	contacts: NormalizedLinkedinContact[];
};

export function getLinkedinContactsSourceName({
	user,
	identity
}: Pick<ViewerWorkspace, 'user' | 'identity'>) {
	const ownerLabel = user.displayName?.trim() || identity.email.trim();

	return `${ownerLabel}'s LinkedIn contacts`;
}

function clampText(value: string, maxLength: number) {
	const normalized = value.trim();

	return normalized.length > maxLength ? normalized.slice(0, maxLength).trim() : normalized;
}

function normalizeLinkedinContact(
	contact: NonNullable<LinkedinContactsImport>['contacts'][number]
) {
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
	source: LinkedinContactsImport
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
				kind: 'linkedinContacts',
				fileName,
				contacts
			}
		: null;
}

export async function insertLinkedinContactsForExternalDataSource(
	ctx: MutationCtx,
	args: {
		workspaceId: Id<'workspaces'>;
		externalDataSourceId: Id<'externalDataSources'>;
		contactsSource: NormalizedLinkedinContactsSource;
		createdAt: number;
	}
) {
	for (const contact of args.contactsSource.contacts) {
		await ctx.db.insert('externalDataSourceLinkedinContacts', {
			workspaceId: args.workspaceId,
			externalDataSourceId: args.externalDataSourceId,
			...contact,
			createdAt: args.createdAt
		});
	}
}

export async function createLinkedinContactsExternalDataSource(
	ctx: MutationCtx,
	viewerWorkspace: ViewerWorkspace,
	contactsSource: NormalizedLinkedinContactsSource,
	createdAt: number
) {
	const { user, workspace } = viewerWorkspace;
	const externalDataSourceId = await ctx.db.insert('externalDataSources', {
		workspaceId: workspace._id,
		createdByUserId: user._id,
		kind: 'linkedinContacts',
		name: getLinkedinContactsSourceName(viewerWorkspace),
		sourceFileName: contactsSource.fileName,
		recordCount: contactsSource.contacts.length,
		status: 'ready',
		createdAt,
		updatedAt: createdAt
	});

	await insertLinkedinContactsForExternalDataSource(ctx, {
		workspaceId: workspace._id,
		externalDataSourceId,
		contactsSource,
		createdAt
	});

	return externalDataSourceId;
}

export async function deleteExternalDataSourceRows(
	ctx: MutationCtx,
	externalDataSourceId: Id<'externalDataSources'>
) {
	const contacts = await ctx.db
		.query('externalDataSourceLinkedinContacts')
		.withIndex('by_externalDataSource', (q) =>
			q.eq('externalDataSourceId', externalDataSourceId)
		)
		.collect();

	for (const contact of contacts) {
		await ctx.db.delete(contact._id);
	}
}

export async function replaceLinkedinContactsExternalDataSource(
	ctx: MutationCtx,
	args: {
		workspaceId: Id<'workspaces'>;
		source: Doc<'externalDataSources'>;
		contactsImport: NonNullable<LinkedinContactsImport>;
		updatedAt: number;
	}
) {
	if (args.source.kind !== 'linkedinContacts') {
		throw new Error('This external data source cannot be replaced with LinkedIn contacts.');
	}

	const contactsSource = normalizeLinkedinContactsSource(args.contactsImport);

	if (!contactsSource) {
		throw new Error('LinkedIn contacts are required.');
	}

	await deleteExternalDataSourceRows(ctx, args.source._id);
	await insertLinkedinContactsForExternalDataSource(ctx, {
		workspaceId: args.workspaceId,
		externalDataSourceId: args.source._id,
		contactsSource,
		createdAt: args.updatedAt
	});
	await ctx.db.patch(args.source._id, {
		sourceFileName: contactsSource.fileName,
		recordCount: contactsSource.contacts.length,
		status: 'ready',
		updatedAt: args.updatedAt
	});

	return {
		sourceFileName: contactsSource.fileName,
		recordCount: contactsSource.contacts.length,
		updatedAt: args.updatedAt
	};
}
