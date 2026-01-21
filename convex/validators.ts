/**
 * Shared Convex Validators
 * Reusable validators for attachments, schedules, and table data.
 */

import { v } from "convex/values";

// ============================================
// ATTACHMENT VALIDATORS
// ============================================

export const kpiAttachmentValidator = v.object({
  metric: v.string(),
  definition: v.string(),
  antiDefinition: v.string(),
});

export const personAttachmentValidator = v.object({
  id: v.string(),
  name: v.string(),
});

export const fileAttachmentValidator = v.object({
  fileName: v.string(),
  context: v.optional(v.string()),
});

export const connectorAttachmentValidator = v.object({
  id: v.string(),
  title: v.string(),
  logo: v.string(),
});

/** All attachment args for use in mutations */
export const attachmentArgs = {
  attachedKpis: v.optional(v.array(kpiAttachmentValidator)),
  attachedPeople: v.optional(v.array(personAttachmentValidator)),
  attachedFiles: v.optional(v.array(fileAttachmentValidator)),
  attachedConnectors: v.optional(v.array(connectorAttachmentValidator)),
};

// ============================================
// SCHEDULE VALIDATOR
// ============================================

export const scheduleValidator = v.object({
  rrule: v.string(),
  frequency: v.union(
    v.literal("weekly"),
    v.literal("monthly"),
    v.literal("quarterly"),
  ),
  dataRangeDays: v.number(),
});

// ============================================
// TABLE DATA VALIDATOR
// ============================================

export const tableRowValidator = v.object({
  column1: v.string(),
  column2: v.string(),
  column3: v.string(),
  column4: v.string(),
  column5: v.string(),
});
