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
    gradientFrom: v.string(),
    gradientVia: v.string(),
    gradientTo: v.string(),
    image: v.optional(v.string()),
  }),

  // ============================================
  // ANSWERS FEATURE (questions + answers)
  // ============================================
  questions: defineTable({
    // TODO: Define fields when implementing
  }),

  answers: defineTable({
    // TODO: Define fields when implementing
    // questionId: v.id("questions"),
  }),

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
