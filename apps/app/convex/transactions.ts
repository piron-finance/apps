import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const recordDeposit = mutation({
  args: {
    userId: v.id("users"),
    poolId: v.id("pools"),
    amount: v.string(),
    shares: v.string(),
    txHash: v.string(),
    blockNumber: v.number(),
    gasUsed: v.optional(v.string()),
    gasPrice: v.optional(v.string()),
    eventData: v.optional(
      v.object({
        receiver: v.optional(v.string()),
        owner: v.optional(v.string()),
        metadata: v.optional(v.any()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    const pool = await ctx.db.get(args.poolId);
    if (!pool) {
      throw new ConvexError("Pool not found");
    }

    const transactionId = await ctx.db.insert("transactions", {
      userId: args.userId,
      poolId: args.poolId,
      type: "DEPOSIT",
      amount: args.amount,
      shares: args.shares,
      txHash: args.txHash,
      blockNumber: args.blockNumber,
      gasUsed: args.gasUsed,
      gasPrice: args.gasPrice,
      status: "CONFIRMED",
      eventData: args.eventData,
      createdAt: Date.now(),
      confirmedAt: Date.now(),
      updatedAt: Date.now(),
    });

    const currentRaised = parseFloat(pool.totalRaised || "0");
    const depositAmount = parseFloat(args.amount);
    const newTotalRaised = (currentRaised + depositAmount).toString();

    const existingInvestorTransaction = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("poolId"), args.poolId))
      .filter((q) => q.eq(q.field("type"), "DEPOSIT"))
      .filter((q) => q.eq(q.field("status"), "CONFIRMED"))
      .first();

    const isNewInvestor = !existingInvestorTransaction;
    const currentInvestors = pool.totalInvestors || 0;
    const newTotalInvestors = isNewInvestor
      ? currentInvestors + 1
      : currentInvestors;

    await ctx.db.patch(args.poolId, {
      totalRaised: newTotalRaised,
      totalInvestors: newTotalInvestors,
      updatedAt: Date.now(),
    });

    return transactionId;
  },
});

export const getTransactionsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return Promise.all(
      transactions.map(async (tx) => {
        const pool = await ctx.db.get(tx.poolId);
        return {
          ...tx,
          pool,
        };
      })
    );
  },
});

export const getTransactionsByPool = query({
  args: { poolId: v.id("pools") },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_pool", (q) => q.eq("poolId", args.poolId))
      .order("desc")
      .collect();

    return Promise.all(
      transactions.map(async (tx) => {
        const user = await ctx.db.get(tx.userId);
        return {
          ...tx,
          user,
        };
      })
    );
  },
});
