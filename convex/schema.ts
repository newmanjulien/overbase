import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================
  // TEMPLATES FEATURE
  // ============================================
  templates: defineTable({
    title: v.string(),
    description: v.string(),
    tags: v.array(v.string()), // e.g., ["Onboarding", "Support"]
    gradient: v.string(), // Key from src/config/gradients.ts (e.g., "sunset", "ocean")
    imageId: v.optional(v.id("_storage")), // Convex file storage reference
  }),

  // ============================================
  // ANSWERS FEATURE (questions + answers)
  // ============================================
  questions: defineTable({
    // Core content
    content: v.string(),
    status: v.union(v.literal("in-progress"), v.literal("completed")),
    privacy: v.union(v.literal("private"), v.literal("team")),
    tags: v.array(v.string()),

    // Question type
    questionType: v.union(v.literal("one-time"), v.literal("recurring")),

    // Recurring schedule (only if questionType === "recurring")
    schedule: v.optional(
      v.object({
        frequency: v.union(
          v.literal("weekly"),
          v.literal("monthly"),
          v.literal("quarterly")
        ),
        deliveryDate: v.number(), // timestamp
        dataRangeFrom: v.optional(v.number()), // timestamp
        dataRangeTo: v.optional(v.number()), // timestamp
      })
    ),

    // Attachments
    attachedKpis: v.optional(
      v.array(
        v.object({
          metric: v.string(),
          definition: v.string(),
          antiDefinition: v.string(),
        })
      )
    ),
    attachedPeople: v.optional(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
        })
      )
    ),
    attachedFiles: v.optional(
      v.array(
        v.object({
          fileName: v.string(),
          context: v.optional(v.string()),
          // fileId: v.optional(v.id("_storage")), // Future: Convex file storage
        })
      )
    ),

    // Future: userId: v.id("users"),
  }),

  answers: defineTable({
    questionId: v.id("questions"),
    topLabel: v.string(), // "You asked" or "Overbase answered"
    content: v.optional(v.string()),
    privacy: v.union(v.literal("private"), v.literal("team")),

    // Generic table data (matches current DataTable)
    tableData: v.optional(
      v.array(
        v.object({
          column1: v.string(),
          column2: v.string(),
          column3: v.string(),
          column4: v.string(),
          column5: v.string(),
        })
      )
    ),

    // Future: avatarId: v.optional(v.id("_storage")),
  }).index("by_questionId", ["questionId"]),

  // ============================================
  // PEOPLE FEATURE
  // ============================================
  people: defineTable({
    // TODO: Define fields when implementing
  }),

  // ============================================
  // CONNECTORS FEATURE
  // ============================================
  connectors: defineTable({
    // TODO: Define fields when implementing
  }),

  // ============================================
  // USERS (future - when auth is added)
  // ============================================
  // users: defineTable({
  //   // TODO: Define fields when implementing auth
  // }),
});
