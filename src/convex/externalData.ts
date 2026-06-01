import { requireViewerWorkspace, type ViewerWorkspace } from '../backend/auth/viewer';
import {
	deleteExternalDataSourceRows,
	insertLinkedinContactsForExternalDataSource,
	normalizeLinkedinContactsSource
} from '../backend/external-data/linkedin-contacts';
import { getEmailFormatActivationState } from '../backend/email-formats/activation';
import {
	deleteExternalDataSourceInput,
	replaceExternalDataSourceInput
} from '../backend/validators/external-data';
import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx } from './_generated/server';
import { mutation, query } from './_generated/server';

function requireWorkspaceOwner({ user, workspace }: ViewerWorkspace) {
	if (workspace.ownerUserId !== user._id) {
		throw new Error('Workspace ownership required.');
	}
}

function getCreatorDisplayName(creator: Doc<'users'> | null) {
	return creator?.displayName?.trim() || 'Unknown user';
}

async function collectExternalDataSourceLinks(
	ctx: MutationCtx,
	externalDataSourceId: Id<'externalDataSources'>
) {
	return await ctx.db
		.query('emailFormatExternalDataLinks')
		.withIndex('by_externalDataSource', (q) =>
			q.eq('externalDataSourceId', externalDataSourceId)
		)
		.collect();
}

async function deleteExternalDataSourceLinks(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	externalDataSourceId: Id<'externalDataSources'>
) {
	const links = await collectExternalDataSourceLinks(ctx, externalDataSourceId);
	const linkedEmailFormatIds = new Set<Id<'emailFormats'>>();

	for (const link of links) {
		if (link.workspaceId === workspaceId) {
			linkedEmailFormatIds.add(link.emailFormatId);
			await ctx.db.delete(link._id);
		}
	}

	return [...linkedEmailFormatIds];
}

async function touchLinkedEmailFormats(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	externalDataSourceId: Id<'externalDataSources'>,
	updatedAt: number
) {
	const links = await collectExternalDataSourceLinks(ctx, externalDataSourceId);
	const linkedEmailFormatIds = new Set<Id<'emailFormats'>>();

	for (const link of links) {
		if (link.workspaceId === workspaceId) {
			linkedEmailFormatIds.add(link.emailFormatId);
		}
	}

	for (const emailFormatId of linkedEmailFormatIds) {
		const format = await ctx.db.get(emailFormatId);

		if (format?.workspaceId === workspaceId) {
			await ctx.db.patch(emailFormatId, { updatedAt });
		}
	}
}

export const listExternalDataSources = query({
	args: {},
	handler: async (ctx) => {
		const { workspace } = await requireViewerWorkspace(ctx);
		const sources = await ctx.db
			.query('externalDataSources')
			.withIndex('by_workspace_createdAt', (q) => q.eq('workspaceId', workspace._id))
			.order('desc')
			.collect();

		return await Promise.all(
			sources.map(async (source) => {
				const [creator, links] = await Promise.all([
					ctx.db.get(source.createdByUserId),
					ctx.db
						.query('emailFormatExternalDataLinks')
						.withIndex('by_externalDataSource', (q) =>
							q.eq('externalDataSourceId', source._id)
						)
						.collect()
				]);

				return {
					id: source._id,
					kind: source.kind,
					name: source.name,
					sourceFileName: source.sourceFileName,
					recordCount: source.recordCount,
					status: source.status,
					importedAt: source.createdAt,
					updatedAt: source.updatedAt,
					creator: {
						name: getCreatorDisplayName(creator),
						avatarUrl: creator?.avatar?.url ?? ''
					},
					linkedFormatCount: new Set(
						links
							.filter((link) => link.workspaceId === workspace._id)
							.map((link) => link.emailFormatId)
					).size
				};
			})
		);
	}
});

export const deleteExternalDataSource = mutation({
	args: deleteExternalDataSourceInput,
	handler: async (ctx, args) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const { workspace } = viewerWorkspace;
		requireWorkspaceOwner(viewerWorkspace);

		const source = await ctx.db.get(args.externalDataSourceId);

		if (!source || source.workspaceId !== workspace._id) {
			throw new Error('External data source not found.');
		}

		const now = Date.now();
		const linkedEmailFormatIds = await deleteExternalDataSourceLinks(
			ctx,
			workspace._id,
			source._id
		);

		await deleteExternalDataSourceRows(ctx, source._id);

		for (const emailFormatId of linkedEmailFormatIds) {
			const format = await ctx.db.get(emailFormatId);

			if (format?.workspaceId === workspace._id) {
				const { readiness } = await getEmailFormatActivationState(
					ctx,
					workspace._id,
					format
				);

				await ctx.db.patch(emailFormatId, {
					...(format.status === 'active' && !readiness.canActivate
						? { status: 'paused' as const }
						: {}),
					updatedAt: now
				});
			}
		}

		await ctx.db.delete(source._id);
	}
});

export const replaceExternalDataSource = mutation({
	args: replaceExternalDataSourceInput,
	handler: async (ctx, args) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const { workspace } = viewerWorkspace;
		requireWorkspaceOwner(viewerWorkspace);

		const source = await ctx.db.get(args.externalDataSourceId);

		if (!source || source.workspaceId !== workspace._id) {
			throw new Error('External data source not found.');
		}

		if (source.kind !== 'linkedinContacts') {
			throw new Error('This external data source cannot be replaced with LinkedIn contacts.');
		}

		const contactsSource = normalizeLinkedinContactsSource(args.externalDataImport);

		if (!contactsSource) {
			throw new Error('LinkedIn contacts are required.');
		}

		const now = Date.now();

		await deleteExternalDataSourceRows(ctx, source._id);
		await insertLinkedinContactsForExternalDataSource(ctx, {
			workspaceId: workspace._id,
			externalDataSourceId: source._id,
			contactsSource,
			createdAt: now
		});
		await ctx.db.patch(source._id, {
			sourceFileName: contactsSource.fileName,
			recordCount: contactsSource.contacts.length,
			status: 'ready',
			updatedAt: now
		});
		await touchLinkedEmailFormats(ctx, workspace._id, source._id, now);
	}
});
