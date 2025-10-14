import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const create = mutation({
  args: {
    adminId: v.id("admins"),
    action: v.union(
      v.literal("POOL_CREATED"),
      v.literal("POOL_APPROVED"),
      v.literal("POOL_REJECTED"),
      v.literal("USER_ROLE_CHANGED")
    ),
    targetId: v.optional(v.string()),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminId);
    if (!admin) {
      throw new ConvexError("Admin not found");
    }

    const actionId = await ctx.db.insert("adminActions", {
      adminId: args.adminId,
      action: args.action,
      targetId: args.targetId,
      details: args.details,
      createdAt: Date.now(),
    });

    return actionId;
  },
});

export const getActionsByAdmin = query({
  args: { adminId: v.id("admins") },
  handler: async (ctx, args) => {
    const actions = await ctx.db
      .query("adminActions")
      .withIndex("by_admin", (q) => q.eq("adminId", args.adminId))
      .order("desc")
      .collect();

    const actionsWithDetails = await Promise.all(
      actions.map(async (action) => {
        const admin = await ctx.db.get(action.adminId);
        return {
          ...action,
          adminName: admin?.name || "Unknown Admin",
        };
      })
    );

    return actionsWithDetails;
  },
});

export const getAllActions = query({
  args: {},
  handler: async (ctx) => {
    const actions = await ctx.db.query("adminActions").order("desc").collect();

    const actionsWithDetails = await Promise.all(
      actions.map(async (action) => {
        const admin = await ctx.db.get(action.adminId);
        return {
          ...action,
          adminName: admin?.name || "Unknown Admin",
        };
      })
    );

    return actionsWithDetails;
  },
});
