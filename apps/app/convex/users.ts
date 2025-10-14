import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    return user;
  },
});

export const getUserByWallet = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_primary_wallet", (q) =>
        q.eq("primaryWallet", args.walletAddress)
      )
      .first();

    return user;
  },
});

export const createOrUpdate = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        image: args.image,
        updatedAt: Date.now(),
      });
      return existingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      image: args.image,
      primaryWallet: "",
      walletAddresses: [],
      kycStatus: "NOT_STARTED",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

export const addWalletAddress = mutation({
  args: {
    userId: v.id("users"),
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    const walletAddresses = user.walletAddresses || [];
    if (!walletAddresses.includes(args.walletAddress)) {
      walletAddresses.push(args.walletAddress);
    }

    if (!user.primaryWallet) {
      await ctx.db.patch(args.userId, {
        primaryWallet: args.walletAddress,
        walletAddresses,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.patch(args.userId, {
        walletAddresses,
        updatedAt: Date.now(),
      });
    }

    return args.userId;
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").order("desc").collect();
  },
});

export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userId);
    return true;
  },
});

export const updateKycStatus = mutation({
  args: {
    userId: v.id("users"),
    kycStatus: v.union(
      v.literal("NOT_STARTED"),
      v.literal("IN_PROGRESS"),
      v.literal("PENDING_REVIEW"),
      v.literal("APPROVED"),
      v.literal("REJECTED"),
      v.literal("EXPIRED")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      kycStatus: args.kycStatus,
      updatedAt: Date.now(),
    });
    return args.userId;
  },
});