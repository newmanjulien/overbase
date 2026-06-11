import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { action, internalMutation, mutation, query } from "./_generated/server";
import {
  getTeamMemberDisplayName,
  normalizeTeamMemberEmail,
  normalizeTeamMemberName,
  TEAM_MEMBER_EMAIL_REGEX,
  TEAM_MEMBER_EMAIL_SEPARATOR_REGEX,
} from "./teamMemberIdentity";
import {
  getViewerWorkspaceRecord,
  requireViewerWorkspace,
} from "../backend/auth/viewer";

const LOOPS_TRANSACTIONAL_ENDPOINT =
  "https://app.loops.so/api/v1/transactional";

type AddTeamMembersResult = {
  insertedTeamMembers: {
    id: Id<"teamMembers">;
    email: string;
  }[];
  skippedEmails: string[];
  workspaceName: string;
  inviterName: string;
};

function toTeamMemberResult(teamMember: {
  _id: Id<"teamMembers">;
  email: string;
  name: string;
  role: string;
  createdAt: number;
  updatedAt: number;
}) {
  return {
    id: teamMember._id,
    email: teamMember.email,
    name: teamMember.name,
    role: teamMember.role,
    displayName: getTeamMemberDisplayName(teamMember),
    createdAt: teamMember.createdAt,
    updatedAt: teamMember.updatedAt,
  };
}

function parseEmails(input: string[]) {
  const normalizedEmails = input
    .flatMap((value) => value.split(TEAM_MEMBER_EMAIL_SEPARATOR_REGEX))
    .map(normalizeTeamMemberEmail)
    .filter(Boolean);
  const uniqueEmails = [...new Set(normalizedEmails)];
  const invalidEmails = uniqueEmails.filter(
    (email) => !TEAM_MEMBER_EMAIL_REGEX.test(email),
  );

  if (invalidEmails.length > 0) {
    throw new Error(`Invalid email: ${invalidEmails[0]}`);
  }

  return uniqueEmails;
}

function getLoopsConfig() {
  const apiKey = process.env.LOOPS_API_KEY?.trim();
  const transactionalId =
    process.env.LOOPS_TEAM_MEMBER_ADDED_TRANSACTIONAL_ID?.trim();
  //we should use the word team member to refer to this type of user

  if (!apiKey || !transactionalId) {
    return null;
  }

  return { apiKey, transactionalId };
}

async function sendTeamMemberAddedEmail({
  apiKey,
  email,
  inviterName,
  transactionalId,
  workspaceName,
}: {
  apiKey: string;
  email: string;
  inviterName: string;
  transactionalId: string;
  workspaceName: string;
}) {
  const response = await fetch(LOOPS_TRANSACTIONAL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      transactionalId,
      addToAudience: false,
      dataVariables: {
        inviterName,
        workspaceName,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Loops rejected ${email}.`);
  }
}

export const listTeamMembers = query({
  args: {},
  handler: async (ctx) => {
    const { workspace } = await requireViewerWorkspace(ctx);
    const teamMembers = await ctx.db
      .query("teamMembers")
      .withIndex("by_workspace_createdAt", (q) =>
        q.eq("workspaceId", workspace._id),
      )
      .order("desc")
      .collect();

    return teamMembers.map(toTeamMemberResult);
  },
});

export const insertTeamMembersForNotification = internalMutation({
  args: {
    emails: v.array(v.string()),
  },
  handler: async (ctx, { emails }): Promise<AddTeamMembersResult> => {
    const { admin, identity, workspace } = await requireViewerWorkspace(ctx);
    const normalizedEmails = parseEmails(emails);

    if (normalizedEmails.length === 0) {
      throw new Error("Add at least one email.");
    }

    const now = Date.now();
    const insertedTeamMembers = [];
    const skippedEmails = [];

    for (const email of normalizedEmails) {
      const existingTeamMember = await ctx.db
        .query("teamMembers")
        .withIndex("by_workspace_email", (q) =>
          q.eq("workspaceId", workspace._id).eq("email", email),
        )
        .first();

      if (existingTeamMember) {
        skippedEmails.push(email);
        continue;
      }

      const id = await ctx.db.insert("teamMembers", {
        email,
        workspaceId: workspace._id,
        name: "",
        role: "",
        createdAt: now,
        updatedAt: now,
      });

      insertedTeamMembers.push({ id, email });
    }

    return {
      insertedTeamMembers,
      skippedEmails,
      workspaceName: workspace.name,
      inviterName: admin.displayName?.trim() || identity.email,
    };
  },
});

export const addTeamMembersAndNotify = action({
  args: {
    emails: v.array(v.string()),
  },
  handler: async (
    ctx,
    { emails },
  ): Promise<AddTeamMembersResult & { notificationFailedEmails: string[] }> => {
    const result: AddTeamMembersResult = await ctx.runMutation(
      internal.teamMembers.insertTeamMembersForNotification,
      { emails },
    );
    const loopsConfig = getLoopsConfig();
    const notificationFailedEmails = [];

    if (!loopsConfig) {
      return {
        ...result,
        notificationFailedEmails: result.insertedTeamMembers.map(
          (teamMember) => teamMember.email,
        ),
      };
    }

    for (const teamMember of result.insertedTeamMembers) {
      try {
        await sendTeamMemberAddedEmail({
          apiKey: loopsConfig.apiKey,
          email: teamMember.email,
          inviterName: result.inviterName,
          transactionalId: loopsConfig.transactionalId,
          workspaceName: result.workspaceName,
        });
      } catch {
        notificationFailedEmails.push(teamMember.email);
      }
    }

    return {
      ...result,
      notificationFailedEmails,
    };
  },
});

export const updateTeamMember = mutation({
  args: {
    teamMemberId: v.id("teamMembers"),
    email: v.string(),
    name: v.string(),
    role: v.string(),
  },
  handler: async (ctx, { teamMemberId, email, name, role }) => {
    const viewerWorkspace = await requireViewerWorkspace(ctx);
    const { workspace } = viewerWorkspace;
    const teamMember = getViewerWorkspaceRecord(
      viewerWorkspace,
      await ctx.db.get(teamMemberId),
    );

    if (!teamMember) {
      throw new Error("Team member not found.");
    }

    const normalizedEmail = normalizeTeamMemberEmail(email);

    if (!TEAM_MEMBER_EMAIL_REGEX.test(normalizedEmail)) {
      throw new Error(`Invalid email: ${normalizedEmail || email}`);
    }

    const existingTeamMember = await ctx.db
      .query("teamMembers")
      .withIndex("by_workspace_email", (q) =>
        q.eq("workspaceId", workspace._id).eq("email", normalizedEmail),
      )
      .first();

    if (existingTeamMember && existingTeamMember._id !== teamMemberId) {
      throw new Error(`Email already exists: ${normalizedEmail}`);
    }

    const updatedTeamMember = {
      ...teamMember,
      email: normalizedEmail,
      name: normalizeTeamMemberName(name),
      role: role.trim(),
      updatedAt: Date.now(),
    };

    await ctx.db.patch(teamMemberId, {
      email: updatedTeamMember.email,
      name: updatedTeamMember.name,
      role: updatedTeamMember.role,
      updatedAt: updatedTeamMember.updatedAt,
    });

    return toTeamMemberResult(updatedTeamMember);
  },
});

export const deleteTeamMembers = mutation({
  args: {
    teamMemberIds: v.array(v.id("teamMembers")),
  },
  handler: async (ctx, { teamMemberIds }) => {
    const { workspace } = await requireViewerWorkspace(ctx);
    for (const teamMemberId of new Set(teamMemberIds)) {
      const teamMember = await ctx.db.get(teamMemberId);

      if (teamMember && teamMember.workspaceId === workspace._id) {
        await ctx.db.delete(teamMemberId);
      }
    }
  },
});
