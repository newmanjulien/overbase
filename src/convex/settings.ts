import { v } from 'convex/values';
import { mutation } from './_generated/server';
import {
	createUploadedAvatarOrDelete,
	deleteReplacedUploadedAvatar
} from './avatar';
import { requireViewerWorkspace } from './auth';

const MAX_NAME_LENGTH = 32;
const MAX_FILE_NAME_LENGTH = 255;

function normalizeName(value: string, fieldName: string) {
	const name = value.trim();

	if (!name) {
		throw new Error(`${fieldName} is required.`);
	}

	if (name.length > MAX_NAME_LENGTH) {
		throw new Error(`${fieldName} must be ${MAX_NAME_LENGTH} characters or fewer.`);
	}

	return name;
}

function normalizeFileName(fileName: string | undefined) {
	const normalizedFileName = fileName?.trim();

	if (!normalizedFileName) {
		return undefined;
	}

	return normalizedFileName.slice(0, MAX_FILE_NAME_LENGTH);
}

export const updateUserName = mutation({
	args: {
		displayName: v.string()
	},
	handler: async (ctx, { displayName }) => {
		const { user } = await requireViewerWorkspace(ctx);
		const now = Date.now();
		const name = normalizeName(displayName, 'Name');

		await ctx.db.patch(user._id, {
			displayName: name,
			updatedAt: now
		});

		return { displayName: name };
	}
});

export const updateWorkspaceName = mutation({
	args: {
		name: v.string()
	},
	handler: async (ctx, { name }) => {
		const { workspace } = await requireViewerWorkspace(ctx);
		const now = Date.now();
		const workspaceName = normalizeName(name, 'Company name');

		await ctx.db.patch(workspace._id, {
			name: workspaceName,
			updatedAt: now
		});

		return { name: workspaceName };
	}
});

export const generateAvatarUploadUrl = mutation({
	args: {},
	handler: async (ctx) => {
		await requireViewerWorkspace(ctx);

		return await ctx.storage.generateUploadUrl();
	}
});

export const saveUserAvatar = mutation({
	args: {
		storageId: v.id('_storage'),
		fileName: v.optional(v.string())
	},
	handler: async (ctx, { storageId, fileName }) => {
		const { user } = await requireViewerWorkspace(ctx);
		const avatarResult = await createUploadedAvatarOrDelete(
			ctx,
			storageId,
			normalizeFileName(fileName),
			Date.now()
		);

		if (!avatarResult.ok) {
			return avatarResult;
		}

		const { avatar } = avatarResult;

		await ctx.db.patch(user._id, {
			avatar,
			updatedAt: avatar.updatedAt
		});
		await deleteReplacedUploadedAvatar(ctx, user.avatar, storageId);

		return { ok: true, avatar };
	}
});

export const saveWorkspaceAvatar = mutation({
	args: {
		storageId: v.id('_storage'),
		fileName: v.optional(v.string())
	},
	handler: async (ctx, { storageId, fileName }) => {
		const { workspace } = await requireViewerWorkspace(ctx);
		const avatarResult = await createUploadedAvatarOrDelete(
			ctx,
			storageId,
			normalizeFileName(fileName),
			Date.now()
		);

		if (!avatarResult.ok) {
			return avatarResult;
		}

		const { avatar } = avatarResult;

		await ctx.db.patch(workspace._id, {
			avatar,
			updatedAt: avatar.updatedAt
		});
		await deleteReplacedUploadedAvatar(ctx, workspace.avatar, storageId);

		return { ok: true, avatar };
	}
});
