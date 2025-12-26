import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================
  // APP ASSETS (branding images stored in Convex)
  // ============================================
  appAssets: defineTable({
    key: v.string(), // Unique identifier, e.g., "overbase-logo", "overbase-icon"
    name: v.string(), // Human-readable name
    imageId: v.id("_storage"), // Convex file storage reference
  }).index("by_key", ["key"]),

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
  // QUESTIONS FEATURE (thread metadata + answers)
  // ============================================

  /**
   * Questions table - Thread metadata container (minimal fields)
   *
   * Content, attachments, and all messages are stored in `answers`.
   * Status is derived from the last answer's sender.
   * questionType is derived from schedule presence (undefined = one-time).
   */
  questions: defineTable({
    // Thread-level privacy (can be toggled for entire thread)
    privacy: v.union(v.literal("private"), v.literal("team")),

    // Recurring schedule (undefined = one-time question)
    schedule: v.optional(
      v.object({
        frequency: v.union(
          v.literal("weekly"),
          v.literal("monthly"),
          v.literal("quarterly")
        ),

        // Weekly: which day (0=Sun, 1=Mon, ..., 6=Sat)
        dayOfWeek: v.optional(v.number()),

        // Monthly: specific day of month (1-31, or -1 for last day)
        dayOfMonth: v.optional(v.number()),

        // Monthly: nth weekday pattern (1=first, 2=second, 3=third, 4=fourth)
        // Used with dayOfWeek for patterns like "first Monday"
        nthWeek: v.optional(v.number()),

        // Quarterly: predefined day patterns
        quarterDay: v.optional(
          v.union(
            v.literal("first"),
            v.literal("last"),
            v.literal("second-month-first"),
            v.literal("third-month-first")
          )
        ),

        // Quarterly: predefined weekday patterns
        quarterWeekday: v.optional(
          v.union(v.literal("first-monday"), v.literal("last-monday"))
        ),

        // Data range: how many days of data to analyze before delivery
        dataRangeDays: v.number(),
      })
    ),

    // Soft delete - if present, question was cancelled at this timestamp
    // Can only cancel when there's exactly 1 answer (initial question)
    cancelledAt: v.optional(v.number()),

    // Future: userId: v.id("users"),
  }),

  /**
   * Answers table - All messages in a question thread
   *
   * Includes the original question (sender: "user", first entry),
   * Overbase responses (sender: "overbase"), and follow-up questions.
   * Attachments are stored on the message they were added with.
   */
  answers: defineTable({
    // Links to parent question thread
    questionThreadId: v.id("questions"),

    // Who sent this message
    sender: v.union(v.literal("user"), v.literal("overbase")),

    // Message content
    content: v.optional(v.string()),

    // Per-message privacy (usually matches thread, but can differ)
    privacy: v.union(v.literal("private"), v.literal("team")),

    // Data table (only on Overbase responses)
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

    // Attachments (typically on user's "You asked" messages)
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
        })
      )
    ),

    // Future: avatarId: v.optional(v.id("_storage")),
  }).index("by_questionThreadId", ["questionThreadId"]),

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
