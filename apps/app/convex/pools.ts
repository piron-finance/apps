import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const create = mutation({
  args: {
    adminId: v.id("admins"),
    contractAddress: v.string(),
    managerAddress: v.string(),
    escrowAddress: v.string(),
    symbol: v.string(),
    issuer: v.string(),
    name: v.string(),
    description: v.string(),
    targetAmount: v.string(),
    minimumInvestment: v.string(),
    discountRate: v.number(),
    chains: v.array(v.string()),
    image: v.string(),
    maturityDate: v.number(),
    expectedReturn: v.string(),
    category: v.union(
      v.literal("REAL_ESTATE"),
      v.literal("COMMODITIES"),
      v.literal("PRIVATE_EQUITY"),
      v.literal("VENTURE_CAPITAL"),
      v.literal("INFRASTRUCTURE"),
      v.literal("OTHER")
    ),
    riskLevel: v.union(
      v.literal("LOW"),
      v.literal("MEDIUM"),
      v.literal("HIGH")
    ),
    instrumentType: v.union(
      v.literal("DISCOUNTED"),
      v.literal("INTEREST_BEARING")
    ),
    assetType: v.string(),
    location: v.string(),
    investorType: v.union(
      v.literal("ACCREDITED"),
      v.literal("RETAIL"),
      v.literal("INSTITUTIONAL")
    ),
    tags: v.array(v.string()),
    couponRates: v.optional(v.array(v.string())),
    couponDates: v.optional(v.array(v.number())),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminId);
    if (!admin) {
      throw new ConvexError("Admin not found");
    }

    const poolId = await ctx.db.insert("pools", {
      contractAddress: args.contractAddress,
      managerAddress: args.managerAddress,
      escrowAddress: args.escrowAddress,
      name: args.name,
      description: args.description,
      asset: "USD", // Default asset
      chains: args.chains,
      targetRaise: args.targetAmount,
      totalRaised: "0",
      minInvestment: args.minimumInvestment,
      instrumentType: args.instrumentType,
      riskLevel: args.riskLevel,
      epochEndTime: args.maturityDate,
      maturityDate: args.maturityDate,
      discountRate: args.discountRate,
      issuer: args.issuer,
      symbol: args.symbol,
      image: args.image,
      createdBy: args.adminId,
      approvalStatus: "APPROVED",
      status: "FUNDING",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("adminActions", {
      adminId: args.adminId,
      action: "POOL_CREATED",
      targetId: poolId,
      details: `Created pool: ${args.name}`,
      createdAt: Date.now(),
    });

    return poolId;
  },
});

export const getAllPools = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pools").order("desc").collect();
  },
});

export const getAllPoolsWithComputed = query({
  args: {},
  handler: async (ctx) => {
    const pools = await ctx.db.query("pools").order("desc").collect();

    return pools.map((pool) => {
      // Parse numeric values
      const totalRaised = parseFloat(pool.totalRaised || "0");
      const targetRaise = parseFloat(pool.targetRaise || "0");
      const couponRatesNumeric =
        pool.couponRates?.map((r) => parseFloat(r)) || [];

      // Calculate progress percentage
      const progressPercentage =
        targetRaise > 0 ? (totalRaised / targetRaise) * 100 : 0;

      // Calculate APY based on instrument type
      let expectedAPY = 0;
      if (pool.instrumentType === "DISCOUNTED" && pool.discountRate) {
        const durationYears = Math.max(
          (pool.maturityDate - pool.epochEndTime) / (365 * 24 * 60 * 60),
          0.001
        );
        const totalPct =
          (pool.discountRate / (10000 - pool.discountRate)) * 100;
        const annualized = totalPct / durationYears;
        expectedAPY = Math.min(Math.max(annualized, 0), 30);
      } else if (
        pool.instrumentType === "INTEREST_BEARING" &&
        couponRatesNumeric.length > 0
      ) {
        const yearlyBps = couponRatesNumeric.reduce((s, r) => s + r, 0);
        expectedAPY = (yearlyBps / 10000) * 100;
      }

      // Determine if pool is active
      const isActivePool =
        pool.status === "FUNDING" || pool.status === "INVESTED";

      // Calculate weight for APY calculations (used in parent component)
      const poolWeight = Math.max(totalRaised || targetRaise || 0, 0);

      return {
        ...pool,
        // Computed numeric fields
        totalRaisedNumeric: totalRaised,
        targetRaiseNumeric: targetRaise,
        couponRatesNumeric,
        progressPercentage,
        expectedAPY,
        poolWeight,
        isActivePool,
        // Keep original string fields for backwards compatibility
      };
    });
  },
});

export const getById = query({
  args: { poolId: v.id("pools") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.poolId);
  },
});

export const updateStatus = mutation({
  args: {
    poolId: v.id("pools"),
    status: v.union(
      v.literal("FUNDING"),
      v.literal("PENDING_INVESTMENT"),
      v.literal("INVESTED"),
      v.literal("MATURED"),
      v.literal("EMERGENCY")
    ),
    adminId: v.id("admins"),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminId);
    if (!admin) {
      throw new ConvexError("Admin not found");
    }

    const pool = await ctx.db.get(args.poolId);
    if (!pool) {
      throw new ConvexError("Pool not found");
    }

    await ctx.db.patch(args.poolId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("adminActions", {
      adminId: args.adminId,
      action: "POOL_APPROVED",
      targetId: args.poolId,
      details: `Updated pool status to ${args.status}`,
      createdAt: Date.now(),
    });

    return args.poolId;
  },
});

export const deletePool = mutation({
  args: {
    poolId: v.id("pools"),
    adminId: v.id("admins"),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminId);
    if (!admin || admin.role !== "SUPER_ADMIN") {
      throw new ConvexError("Only super admins can delete pools");
    }

    const pool = await ctx.db.get(args.poolId);
    if (!pool) {
      throw new ConvexError("Pool not found");
    }

    await ctx.db.delete(args.poolId);

    await ctx.db.insert("adminActions", {
      adminId: args.adminId,
      action: "POOL_REJECTED",
      targetId: args.poolId,
      details: `Deleted pool: ${pool.name}`,
      createdAt: Date.now(),
    });

    return true;
  },
});

export const syncWithOnchain = mutation({
  args: {
    poolId: v.id("pools"),
    totalRaised: v.string(),
    totalInvestors: v.number(),
    actualInvested: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const pool = await ctx.db.get(args.poolId);
    if (!pool) {
      throw new ConvexError("Pool not found");
    }

    console.log("🔄 Syncing pool with onchain data:", {
      poolId: args.poolId,
      currentTotalRaised: pool.totalRaised,
      newTotalRaised: args.totalRaised,
      currentInvestors: pool.totalInvestors,
      newInvestors: args.totalInvestors,
    });

    await ctx.db.patch(args.poolId, {
      totalRaised: args.totalRaised,
      totalInvestors: args.totalInvestors,
      actualInvested: args.actualInvested,
      updatedAt: Date.now(),
    });

    return true;
  },
});
