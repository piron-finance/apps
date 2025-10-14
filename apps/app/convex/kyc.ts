import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const initiateKyc = mutation({
  args: {
    clerkId: v.optional(v.string()),
    walletAddress: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phoneNumber: v.string(),
    dateOfBirth: v.optional(v.string()),
    nationality: v.optional(v.string()),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    address: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    idType: v.optional(
      v.union(
        v.literal("PASSPORT"),
        v.literal("NATIONAL_ID"),
        v.literal("DRIVERS_LICENSE")
      )
    ),
    idNumber: v.optional(v.string()),
    idExpiryDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let user;

    // Try to find user by Clerk ID first (for signed-in users)
    if (args.clerkId) {
      user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
        .first();
    }

    // If no user found by Clerk ID, try by wallet address (legacy)
    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_primary_wallet", (q) =>
          q.eq("primaryWallet", args.walletAddress)
        )
        .first();
    }

    if (!user) {
      throw new ConvexError("User not found. Please sign up first.");
    }

    // Determine if this is Stage 1 (basic + ID) or Stage 2 (address)
    const isStage1 = args.idType && args.idNumber; // Has ID verification
    const isStage2 = args.city && args.address && args.zipCode; // Has address verification

    // Set KYC status based on completion stage
    let kycStatus:
      | "NOT_STARTED"
      | "IN_PROGRESS"
      | "APPROVED"
      | "PENDING_REVIEW"
      | "REJECTED"
      | "EXPIRED";
    let kycLevel: "BASIC" | "ENHANCED" | "PREMIUM" | undefined;

    if (isStage1 && !isStage2) {
      // Stage 1 complete - can invest up to $10,000
      kycStatus = "APPROVED";
      kycLevel = "BASIC";
    } else if (isStage1 && isStage2) {
      // Stage 2 complete - can invest up to $50,000
      kycStatus = "APPROVED";
      kycLevel = "ENHANCED";
    } else {
      // Incomplete submission
      kycStatus = "IN_PROGRESS";
    }

    // Update existing user with KYC data
    await ctx.db.patch(user._id, {
      primaryWallet: args.walletAddress,
      walletAddresses: user.walletAddresses?.includes(args.walletAddress)
        ? user.walletAddresses
        : [...(user.walletAddresses || []), args.walletAddress],
      kycStatus,
      kycLevel,
      kycData: {
        firstName: args.firstName,
        lastName: args.lastName,
        phoneNumber: args.phoneNumber,
        dateOfBirth: args.dateOfBirth,
        nationality: args.nationality,
        country: args.country,
        city: args.city,
        address: args.address,
        zipCode: args.zipCode,
        idType: args.idType,
        idNumber: args.idNumber,
        idExpiryDate: args.idExpiryDate,
      },
      lastKycUpdate: Date.now(),
      updatedAt: Date.now(),
    });

    return user._id;
  },
});

export const processKycDecision = mutation({
  args: {
    userId: v.id("users"),
    decision: v.union(v.literal("APPROVE"), v.literal("REJECT")),
    adminId: v.id("admins"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminId);
    if (!admin) {
      throw new ConvexError("Admin not found");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    const newStatus = args.decision === "APPROVE" ? "APPROVED" : "REJECTED";

    await ctx.db.patch(args.userId, {
      kycStatus: newStatus,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("adminActions", {
      adminId: args.adminId,
      action: args.decision === "APPROVE" ? "POOL_APPROVED" : "POOL_REJECTED",
      targetId: args.userId,
      details: args.notes || `KYC ${args.decision.toLowerCase()}ed`,
      createdAt: Date.now(),
    });

    return args.userId;
  },
});

export const getUserKycStatus = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_primary_wallet", (q) =>
        q.eq("primaryWallet", args.walletAddress)
      )
      .first();

    return {
      hasUser: !!user,
      kycStatus: user?.kycStatus || "NOT_STARTED",
      user: user || null,
    };
  },
});

export const getUserKycStatusByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return {
      hasUser: !!user,
      kycStatus: user?.kycStatus || "NOT_STARTED",
      user: user || null,
    };
  },
});
