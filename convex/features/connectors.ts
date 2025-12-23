import { query } from "../_generated/server";
// import { v } from "convex/values";

// ============================================
// CONNECTORS FEATURE
// ============================================

// Get all connectors
export const getAllConnectors = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("connectors").collect();
  },
});

// TODO: Add more queries as needed
// - getConnectorById
// - getConnectorsByStatus
// - getActiveConnectors
