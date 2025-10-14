import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const createFirstAdmin = mutation({
  args: {
    clerkId: v.optional(v.string()),
    email: v.string(),
    name: v.string(),
    walletAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingAdmins = await ctx.db.query("admins").collect();

    if (existingAdmins.length > 0) {
      throw new ConvexError("Admin already exists");
    }

    const existingAdmin = await ctx.db
      .query("admins")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingAdmin) {
      throw new ConvexError("User already has admin access");
    }

    const adminId = await ctx.db.insert("admins", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      walletAddress: args.walletAddress,
      role: "SUPER_ADMIN",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return adminId;
  },
});

export const checkAdminByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return {
      isAdmin: !!admin && admin.isActive,
      admin: admin || null,
    };
  },
});

export const checkAdminByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return {
      isAdmin: !!admin && admin.isActive,
      admin: admin || null,
    };
  },
});

export const checkAdminByWallet = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .first();

    return {
      isAdmin: !!admin && admin.isActive,
      admin: admin || null,
    };
  },
});

export const getByWallet = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("admins")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .first();
  },
});

export const getAllAdmins = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("admins").collect();
  },
});

export const createAdmin = mutation({
  args: {
    clerkId: v.optional(v.string()),
    email: v.string(),
    name: v.string(),
    walletAddress: v.optional(v.string()),
    role: v.union(v.literal("ADMIN"), v.literal("SUPER_ADMIN")),
    createdBy: v.id("admins"),
  },
  handler: async (ctx, args) => {
    const creatingAdmin = await ctx.db.get(args.createdBy);
    if (!creatingAdmin || creatingAdmin.role !== "SUPER_ADMIN") {
      throw new ConvexError("Only super admins can create new admins");
    }

    const existingAdmin = await ctx.db
      .query("admins")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingAdmin) {
      throw new ConvexError("User already has admin access");
    }

    const adminId = await ctx.db.insert("admins", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      walletAddress: args.walletAddress,
      role: args.role,
      createdBy: args.createdBy,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return adminId;
  },
});

export const updateAdmin = mutation({
  args: {
    adminId: v.id("admins"),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    role: v.optional(v.union(v.literal("ADMIN"), v.literal("SUPER_ADMIN"))),
    isActive: v.optional(v.boolean()),
    updatedBy: v.id("admins"),
  },
  handler: async (ctx, args) => {
    const updatingAdmin = await ctx.db.get(args.updatedBy);
    if (!updatingAdmin || updatingAdmin.role !== "SUPER_ADMIN") {
      throw new ConvexError("Only super admins can update admins");
    }

    const admin = await ctx.db.get(args.adminId);
    if (!admin) {
      throw new ConvexError("Admin not found");
    }

    const updates: Partial<{
      email: string;
      name: string;
      role: "ADMIN" | "SUPER_ADMIN";
      isActive: boolean;
      updatedAt: number;
    }> = { updatedAt: Date.now() };
    if (args.email !== undefined) updates.email = args.email;
    if (args.name !== undefined) updates.name = args.name;
    if (args.role !== undefined) updates.role = args.role;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.adminId, updates);
    return args.adminId;
  },
});

export const deleteAdmin = mutation({
  args: {
    adminId: v.id("admins"),
    deletedBy: v.id("admins"),
  },
  handler: async (ctx, args) => {
    const deletingAdmin = await ctx.db.get(args.deletedBy);
    if (!deletingAdmin || deletingAdmin.role !== "SUPER_ADMIN") {
      throw new ConvexError("Only super admins can delete admins");
    }

    const admin = await ctx.db.get(args.adminId);
    if (!admin) {
      throw new ConvexError("Admin not found");
    }

    if (admin._id === args.deletedBy) {
      throw new ConvexError("Cannot delete yourself");
    }

    await ctx.db.delete(args.adminId);
    return true;
  },
});
