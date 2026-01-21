/**
 * Shared Types - Derived from Schema
 *
 * These types are derived directly from the Convex schema.
 * They can be imported by both server (Convex) and client (React) code.
 *
 * This is the single source of truth for data shape types.
 */

import type { Doc, Id } from "./_generated/dataModel";

// ============================================
// DOCUMENT TYPES
// ============================================

export type QuestionDoc = Doc<"questions">;
export type AnswerDoc = Doc<"answers">;
export type TemplateDoc = Doc<"templates">;
export type AppAssetDoc = Doc<"appAssets">;
export type PersonDoc = Doc<"people">;

// ============================================
// EXTENDED DOCUMENT TYPES (with resolved URLs)
// ============================================

/** Template with resolved image URL */
export type TemplateWithImage = TemplateDoc & {
  imageUrl: string | null;
};

/** App asset with resolved image URL */
export type AppAssetWithUrl = AppAssetDoc & {
  imageUrl: string | null;
};

// ============================================
// ATTACHMENT ARRAY TYPES
// ============================================

export type AttachedKpis = NonNullable<AnswerDoc["attachedKpis"]>;
export type AttachedPeople = NonNullable<AnswerDoc["attachedPeople"]>;
export type AttachedFiles = NonNullable<AnswerDoc["attachedFiles"]>;
export type AttachedConnectors = NonNullable<AnswerDoc["attachedConnectors"]>;

// ============================================
// ATTACHMENT ITEM TYPES
// ============================================

/** KPI attachment shape as stored in Convex */
export type KpiAttachment = AttachedKpis[number];

/** Person attachment shape as stored in Convex (no photo - see PersonReference for UI) */
export type PersonAttachment = AttachedPeople[number];

/** File attachment shape as stored in Convex */
export type FileAttachment = AttachedFiles[number];

/** Connector attachment shape as stored in Convex */
export type ConnectorAttachment = AttachedConnectors[number];

// ============================================
// SCHEDULE TYPE
// ============================================

/** Schedule pattern for recurring questions */
export type SchedulePattern = NonNullable<QuestionDoc["schedule"]>;

// ============================================
// TABLE DATA TYPE
// ============================================

export type TableData = NonNullable<AnswerDoc["tableData"]>;
export type TableRow = TableData[number];

// ============================================
// ID TYPE RE-EXPORT
// ============================================

export type { Id, Doc };
