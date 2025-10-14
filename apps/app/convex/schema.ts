import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.optional(v.string()),
    email: v.optional(v.string()),
    primaryWallet: v.string(),
    walletAddresses: v.array(v.string()),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    kycStatus: v.union(
      v.literal("NOT_STARTED"),
      v.literal("IN_PROGRESS"),
      v.literal("PENDING_REVIEW"),
      v.literal("APPROVED"),
      v.literal("REJECTED"),
      v.literal("EXPIRED")
    ),
    kycLevel: v.optional(
      v.union(v.literal("BASIC"), v.literal("ENHANCED"), v.literal("PREMIUM"))
    ),
    kycData: v.optional(
      v.object({
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        dateOfBirth: v.optional(v.string()),
        nationality: v.optional(v.string()),
        country: v.optional(v.string()),
        city: v.optional(v.string()),
        address: v.optional(v.string()),
        zipCode: v.optional(v.string()),
        phoneNumber: v.optional(v.string()),
        idType: v.optional(
          v.union(
            v.literal("PASSPORT"),
            v.literal("NATIONAL_ID"),
            v.literal("DRIVERS_LICENSE")
          )
        ),
        idNumber: v.optional(v.string()),
        idExpiryDate: v.optional(v.string()),
        proofOfAddress: v.optional(v.string()),
        idDocumentFront: v.optional(v.string()),
        idDocumentBack: v.optional(v.string()),
        selfieWithId: v.optional(v.string()),
      })
    ),
    investmentLimits: v.optional(
      v.object({
        daily: v.optional(v.string()),
        monthly: v.optional(v.string()),
        total: v.optional(v.string()),
      })
    ),
    complianceFlags: v.optional(v.array(v.string())),
    lastKycUpdate: v.optional(v.number()),
    kycExpiryDate: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_primary_wallet", ["primaryWallet"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_kyc_status", ["kycStatus"]),

  admins: defineTable({
    clerkId: v.optional(v.string()),
    email: v.string(),
    name: v.string(),
    walletAddress: v.optional(v.string()),
    role: v.union(v.literal("ADMIN"), v.literal("SUPER_ADMIN")),
    createdBy: v.optional(v.id("admins")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_wallet", ["walletAddress"])
    .index("by_role", ["role"])
    .index("by_active", ["isActive"]),

  pools: defineTable({
    contractAddress: v.string(),
    managerAddress: v.string(),
    escrowAddress: v.string(),
    name: v.string(),
    symbol: v.optional(v.string()),
    asset: v.string(),
    assetType: v.optional(v.string()),
    image: v.optional(v.string()),
    description: v.string(),
    chains: v.array(v.string()),
    location: v.optional(v.string()),
    investorType: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    tvl: v.optional(v.string()),
    totalInvestors: v.optional(v.number()),
    minInvestment: v.optional(v.string()),
    instrumentType: v.union(
      v.literal("DISCOUNTED"),
      v.literal("INTEREST_BEARING")
    ),
    status: v.union(
      v.literal("FUNDING"),
      v.literal("PENDING_INVESTMENT"),
      v.literal("INVESTED"),
      v.literal("MATURED"),
      v.literal("EMERGENCY")
    ),
    targetRaise: v.string(),
    totalRaised: v.string(),
    actualInvested: v.optional(v.string()),
    discountRate: v.optional(v.number()),
    couponRates: v.optional(v.array(v.string())),
    couponDates: v.optional(v.array(v.number())),
    epochEndTime: v.number(),
    maturityDate: v.number(),
    issuer: v.string(),
    riskLevel: v.union(
      v.literal("LOW"),
      v.literal("MEDIUM"),
      v.literal("HIGH")
    ),
    createdBy: v.id("admins"),
    approvedBy: v.optional(v.id("admins")),
    approvalStatus: v.union(
      v.literal("PENDING"),
      v.literal("APPROVED"),
      v.literal("REJECTED")
    ),
    rejectionReason: v.optional(v.string()),
    attachments: v.optional(v.array(v.string())),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_contract", ["contractAddress"])
    .index("by_status", ["status"])
    .index("by_instrument_type", ["instrumentType"])
    .index("by_maturity", ["maturityDate"])
    .index("by_created_by", ["createdBy"])
    .index("by_approval_status", ["approvalStatus"]),

  transactions: defineTable({
    userId: v.id("users"),
    poolId: v.id("pools"),
    type: v.union(
      v.literal("DEPOSIT"),
      v.literal("WITHDRAW"),
      v.literal("EMERGENCY_WITHDRAW"),
      v.literal("REFUND_CLAIMED"),
      v.literal("COUPON_CLAIMED"),
      v.literal("INVESTMENT_CONFIRMED"),
      v.literal("COUPON_PAYMENT_RECEIVED"),
      v.literal("MATURITY_PROCESSED"),
      v.literal("POOL_STATUS_CHANGED"),
      v.literal("SPV_FUNDS_WITHDRAWN"),
      v.literal("SPV_FUNDS_RETURNED")
    ),
    amount: v.string(),
    shares: v.optional(v.string()),
    txHash: v.string(),
    blockNumber: v.number(),
    gasUsed: v.optional(v.string()),
    gasPrice: v.optional(v.string()),
    status: v.union(
      v.literal("PENDING"),
      v.literal("CONFIRMED"),
      v.literal("FAILED"),
      v.literal("DROPPED")
    ),
    eventData: v.optional(
      v.object({
        receiver: v.optional(v.string()),
        owner: v.optional(v.string()),
        oldStatus: v.optional(v.string()),
        newStatus: v.optional(v.string()),
        transferId: v.optional(v.string()),
        proofHash: v.optional(v.string()),
        couponAmount: v.optional(v.string()),
        maturityAmount: v.optional(v.string()),
        metadata: v.optional(v.any()),
      })
    ),
    errorMessage: v.optional(v.string()),
    retryCount: v.optional(v.number()),
    createdAt: v.number(),
    confirmedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_pool", ["poolId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_tx_hash", ["txHash"]),

  adminActions: defineTable({
    adminId: v.id("admins"),
    action: v.union(
      v.literal("POOL_CREATED"),
      v.literal("POOL_APPROVED"),
      v.literal("POOL_REJECTED"),
      v.literal("USER_ROLE_CHANGED")
    ),
    targetId: v.optional(v.string()),
    details: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_admin", ["adminId"])
    .index("by_action", ["action"])
    .index("by_created_at", ["createdAt"]),

  systemSettings: defineTable({
    key: v.string(),
    value: v.string(),
    updatedBy: v.id("users"),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("POOL_APPROVED"),
      v.literal("POOL_REJECTED"),
      v.literal("INVESTMENT_MATURED"),
      v.literal("COUPON_RECEIVED"),
      v.literal("EMERGENCY_ALERT"),
      v.literal("SYSTEM_ANNOUNCEMENT")
    ),
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_read_status", ["isRead"]),
});
