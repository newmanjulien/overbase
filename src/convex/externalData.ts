import { requireViewerWorkspace, type ViewerWorkspace } from '../backend/auth/viewer';
import {
	deleteExternalDataSourceRows,
	replaceLinkedinContactsExternalDataSource
} from '../backend/external-data/linkedin-contacts';
import { getEmailFormatActivationState } from '../backend/email-formats/activation';
import {
	deleteExternalDataSourceInput,
	renameExternalDataSourceInput,
	replaceExternalDataSourceInput
} from '../backend/validators/external-data';
import type { Id } from './_generated/dataModel';
import type { MutationCtx } from './_generated/server';
import { mutation, query } from './_generated/server';

const MAX_EXTERNAL_DATA_SOURCE_NAME_LENGTH = 120;

function requireWorkspaceOwner({ user, workspace }: ViewerWorkspace) {
	if (workspace.ownerUserId !== user._id) {
		throw new Error('Workspace ownership required.');
	}
}

function normalizeExternalDataSourceName(name: string) {
	const normalized = name.trim();

	return normalized.length > MAX_EXTERNAL_DATA_SOURCE_NAME_LENGTH
		? normalized.slice(0, MAX_EXTERNAL_DATA_SOURCE_NAME_LENGTH).trim()
		: normalized;
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

		return sources.map((source) => ({
			id: source._id,
			kind: source.kind,
			name: source.name,
			sourceFileName: source.sourceFileName
		}));
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

export const renameExternalDataSource = mutation({
	args: renameExternalDataSourceInput,
	handler: async (ctx, args) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const { workspace } = viewerWorkspace;
		requireWorkspaceOwner(viewerWorkspace);

		const source = await ctx.db.get(args.externalDataSourceId);

		if (!source || source.workspaceId !== workspace._id) {
			throw new Error('External data source not found.');
		}

		const name = normalizeExternalDataSourceName(args.name);

		if (!name) {
			throw new Error('External data source name is required.');
		}

		const now = Date.now();

		await ctx.db.patch(source._id, {
			name,
			updatedAt: now
		});
		await touchLinkedEmailFormats(ctx, workspace._id, source._id, now);

		return { name };
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

		const now = Date.now();
		const result = await replaceLinkedinContactsExternalDataSource(ctx, {
			workspaceId: workspace._id,
			source,
			contactsImport: args.externalDataImport,
			updatedAt: now
		});

		await touchLinkedEmailFormats(ctx, workspace._id, source._id, now);

		return result;
	}
});
