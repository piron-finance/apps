"use client";

import { useAccount } from "wagmi";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useCreatePool, CreatePoolFormData } from "@/hooks/useCreatePool";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ConnectButton } from "@/lib/connect-button";
import { AlertCircle, Users, CheckCircle, ExternalLink } from "lucide-react";

const formSchema = z.object({
  name: z.string(),
  asset: z.string(),
  assetType: z.string().optional(),
  image: z.string().optional(),
  description: z.string(),
  chains: z.array(z.string()).min(1, "At least one chain is required"),
  location: z.string().optional(),
  investorType: z.string().optional(),
  tags: z.array(z.string()).optional(),
  minInvestment: z.string().optional(),
  instrumentType: z.enum(["DISCOUNTED", "INTEREST_BEARING"]),
  targetRaise: z.string(),
  discountRate: z.number().optional(),
  couponRates: z.array(z.number()).optional(),
  couponDates: z.array(z.number()).optional(),
  epochEndTime: z.string(),
  maturityDate: z.string(),
  issuer: z.string(),
  riskLevel: z.enum(["Low", "Medium", "High"]),
  spvAddress: z.string(),
  couponPayments: z
    .array(
      z.object({
        date: z.string(),
        rate: z.number(),
      })
    )
    .optional(),
  attachments: z.array(z.string()).optional(),
});

export default function CreatePoolPage() {
  const { isConnected, chain } = useAccount();
  const { isSignedIn, user } = useUser();
  const { createPool, isCreating, isSuccess, error, transactionHash } =
    useCreatePool();

  const adminCheck = useQuery(
    api.admins.checkAdminByEmail,
    isSignedIn && user?.emailAddresses?.[0]?.emailAddress
      ? { email: user.emailAddresses[0].emailAddress }
      : "skip"
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      asset: "",
      assetType: "",
      image: "",
      description: "",
      chains: [],
      location: "",
      investorType: "",
      tags: [],
      minInvestment: "",
      instrumentType: "DISCOUNTED",
      targetRaise: "",
      discountRate: undefined,
      couponRates: [],
      couponDates: [],
      epochEndTime: "",
      maturityDate: "",
      issuer: "",
      riskLevel: "Low",
      spvAddress: "",
      couponPayments: [],
      attachments: [],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formData: CreatePoolFormData = {
      ...values,
      chains:
        values.chains.length > 0
          ? values.chains
          : ["morph-holesky", "base-sepolia"],
      assetType: values.assetType || "",
      image:
        values.image ||
        "https://www.freepik.com/free-vector/hand-drawn-cost-living-illustration_74881061.htm#fromView=search&page=1&position=6&uuid=1c914f2d-f3fe-4897-b442-4aed144c3563&query=fixed+income",
      location: values.location || "",
      investorType: values.investorType || "",
      tags: values.tags || [],
      minInvestment: values.minInvestment || "",
      discountRate: values.discountRate,
      couponRates: values.couponRates || [],
      couponDates: values.couponDates || [],
      couponPayments: values.couponPayments || [],
      attachments: values.attachments || [],
    };

    if (!adminCheck?.admin?._id) {
      console.error("Admin not found");
      return;
    }

    createPool(formData, adminCheck.admin._id);
  }

  if (isSuccess && transactionHash) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Pool Created Successfully!
          </h1>
          <p className="text-slate-400 mb-6">
            Your investment pool has been deployed to the blockchain.
          </p>
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-6 mb-6">
            <p className="text-sm text-slate-400 mb-2">Transaction Hash:</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-green-400 bg-slate-900/50 px-3 py-1 rounded text-sm">
                {transactionHash}
              </code>
              {chain?.blockExplorers?.default && (
                <a
                  href={`${chain.blockExplorers.default.url}/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all duration-300"
          >
            Create Another Pool
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-slate-400 mb-6">
            Please connect your wallet to create investment pools.
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">
            Create New Pool
          </h1>
          <p className="text-lg text-slate-400">
            Deploy a new investment pool with tokenized securities
          </p>
          {chain && (
            <p className="text-sm text-slate-500 mt-2">
              Deploying on {chain.name}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 font-medium">Error Creating Pool</p>
            </div>
            <p className="text-red-300 text-sm mt-1">{error}</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/40 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <span>Basic Information</span>
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-400">
                        Pool Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Nigerian Treasury Bills Q3 2025"
                          className="w-full px-4 py-3 bg-slate-900/30 border border-slate-600/20 rounded-xl text-slate-200 placeholder-slate-500 focus:border-orange-500/50 focus:outline-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="asset"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-400">
                        Asset Token *
                      </FormLabel>
                      <FormControl>
                        <select
                          className="w-full px-4 py-3 bg-slate-900/30 border border-slate-600/20 rounded-xl text-slate-200 focus:border-orange-500/50 focus:outline-none"
                          {...field}
                        >
                          <option value="">Select asset token</option>
                          <option value="0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98">
                            USDT (Morph Holesky)
                          </option>
                          <option value="0xEC33dC84aEC542694B490168250b62E53ce6DB17">
                            CNGN (Base Sepolia)
                          </option>
                        </select>
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assetType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-400">
                        Asset Type
                      </FormLabel>
                      <FormControl>
                        <select
                          className="w-full px-4 py-3 bg-slate-900/30 border border-slate-600/20 rounded-xl text-slate-200 focus:border-orange-500/50 focus:outline-none"
                          {...field}
                        >
                          <option value="">Select asset type</option>
                          <option value="STABLECOIN">Stablecoin</option>
                          <option value="FIAT_TOKEN">Fiat Token</option>
                          <option value="CBDC">
                            Central Bank Digital Currency
                          </option>
                        </select>
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chains"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-400">
                        Supported Chains *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Base, Ethereum(comma separated)"
                          className="w-full px-4 py-3 bg-slate-900/30 border border-slate-600/20 rounded-xl text-slate-200 placeholder-slate-500 focus:border-orange-500/50 focus:outline-none"
                          defaultValue={field.value?.join(", ") || ""}
                          onBlur={(e) => {
                            const chains = e.target.value
                              .split(",")
                              .map((chain) => chain.trim())
                              .filter((chain) => chain.length > 0);
                            field.onChange(chains);
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-400">
                        Pool Image URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          className="w-full px-4 py-3 bg-slate-900/30 border border-slate-600/20 rounded-xl text-slate-200 placeholder-slate-500 focus:border-orange-500/50 focus:outline-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-400">
                        Location
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Nigeria, Kenya, Ghana"
                          className="w-full px-4 py-3 bg-slate-900/30 border border-slate-600/20 rounded-xl text-slate-200 placeholder-slate-500 focus:border-orange-500/50 focus:outline-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="investorType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-400">
                        Investor Type
                      </FormLabel>
                      <FormControl>
                        <select
                          className="w-full px-4 py-3 bg-slate-900/30 border border-slate-600/20 rounded-xl text-slate-200 focus:border-orange-500/50 focus:outline-none"
                          {...field}
                        >
                          <option value="">Select investor type</option>
                          <option value="RETAIL">Retail Investors</option>
                          <option value="INSTITUTIONAL">
                            Institutional Investors
                          </option>
                          <option value="ACCREDITED">
                            Accredited Investors
                          </option>
                          <option value="ALL">All Investors</option>
                        </select>
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issuer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-400">
                        Issuer *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Central Bank of Nigeria"
                          className="w-full px-4 py-3 bg-slate-900/30 border border-slate-600/20 rounded-xl text-slate-200 placeholder-slate-500 focus:border-orange-500/50 focus:outline-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="spvAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-400">
                        SPV Address *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0x..."
                          className="w-full px-4 py-3 bg-slate-900/30 border border-slate-600/20 rounded-xl text-slate-200 placeholder-slate-500 focus:border-orange-500/50 focus:outline-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-400">
                        Description *
                      </FormLabel>
                      <FormControl>
                        <textarea
                          placeholder="Describe the investment opportunity..."
                          rows={4}
                          className="w-full px-4 py-3 bg-slate-900/30 border border-slate-600/20 rounded-xl text-slate-200 placeholder-slate-500 focus:border-orange-500/50 focus:outline-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-400">
                        Tags
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., treasury, government, short-term (comma separated)"
                          className="w-full px-4 py-3 bg-slate-900/30 border border-slate-600/20 rounded-xl text-slate-200 placeholder-slate-500 focus:border-orange-500/50 focus:outline-none"
                          defaultValue={field.value?.join(", ") || ""}
                          onBlur={(e) => {
                            const tags = e.target.value
                              .split(",")
                              .map((tag) => tag.trim())
                              .filter((tag) => tag.length > 0);
                            field.onChange(tags);
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/40 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <span>Pool Configuration</span>
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="targetRaise"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-400">
                        Target Raise Amount (USD) *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5000000"
                          className="w-full px-4 py-3 bg-slate-900/30 border border-slate-600/20 rounded-xl text-slate-200 placeholder-slate-500 focus:border-orange-500/50 focus:outline-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minInvestment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-400">
                        Minimum Investment (USD)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1000"
                          className="w-full px-4 py-3 bg-slate-900/30 border border-slate-600/20 rounded-xl text-slate-200 placeholder-slate-500 focus:border-orange-500/50 focus:outline-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="epochEndTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-400">
                        Funding End Time *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          className="w-full px-4 py-3 bg-slate-900/30 border border-slate-600/20 rounded-xl text-slate-200 focus:border-orange-500/50 focus:outline-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maturityDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-400">
                        Maturity Date *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="w-full px-4 py-3 bg-slate-900/30 border border-slate-600/20 rounded-xl text-slate-200 focus:border-orange-500/50 focus:outline-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instrumentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-400">
                        Instrument Type *
                      </FormLabel>
                      <FormControl>
                        <select
                          className="w-full px-4 py-3 bg-slate-900/30 border border-slate-600/20 rounded-xl text-slate-200 focus:border-orange-500/50 focus:outline-none"
                          {...field}
                        >
                          <option value="DISCOUNTED">
                            Discounted (T-Bills, Commercial Paper)
                          </option>
                          <option value="INTEREST_BEARING">
                            Interest Bearing (Bonds, Fixed Deposits)
                          </option>
                        </select>
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="riskLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-400">
                        Risk Level
                      </FormLabel>
                      <FormControl>
                        <select
                          className="w-full px-4 py-3 bg-slate-900/30 border border-slate-600/20 rounded-xl text-slate-200 focus:border-orange-500/50 focus:outline-none"
                          {...field}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Discount Rate for DISCOUNTED instruments */}
              {form.watch("instrumentType") === "DISCOUNTED" && (
                <FormField
                  control={form.control}
                  name="discountRate"
                  render={({ field }) => (
                    <FormItem className="mt-6">
                      <FormLabel className="text-sm font-medium text-slate-400">
                        Discount Rate (%) *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="18.50"
                          className="w-full px-4 py-3 bg-slate-900/30 border border-slate-600/20 rounded-xl text-slate-200 placeholder-slate-500 focus:border-orange-500/50 focus:outline-none"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm" />
                    </FormItem>
                  )}
                />
              )}

              {/* Coupon Configuration for INTEREST_BEARING instruments */}
              {form.watch("instrumentType") === "INTEREST_BEARING" && (
                <div className="mt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-white mb-2">
                      Coupon Payments
                    </h3>
                    <p className="text-sm text-slate-400">
                      Configure payment dates and rates for interest-bearing
                      instruments
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="couponRates"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-400">
                            Coupon Rates (%) *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., 5.5, 6.0, 6.5 (comma separated)"
                              className="w-full px-4 py-3 bg-slate-900/30 border border-slate-600/20 rounded-xl text-slate-200 placeholder-slate-500 focus:border-orange-500/50 focus:outline-none"
                              defaultValue={field.value?.join(", ") || ""}
                              onBlur={(e) => {
                                const rates = e.target.value
                                  .split(",")
                                  .map((rate) => parseFloat(rate.trim()))
                                  .filter((rate) => !isNaN(rate));
                                field.onChange(rates);
                              }}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400 text-sm" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="couponDates"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-400">
                            Coupon Dates *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., 2025-06-15, 2025-12-15 (YYYY-MM-DD, comma separated)"
                              className="w-full px-4 py-3 bg-slate-900/30 border border-slate-600/20 rounded-xl text-slate-200 placeholder-slate-500 focus:border-orange-500/50 focus:outline-none"
                              defaultValue={
                                field.value
                                  ?.map(
                                    (timestamp) =>
                                      new Date(timestamp)
                                        .toISOString()
                                        .split("T")[0]
                                  )
                                  .join(", ") || ""
                              }
                              onBlur={(e) => {
                                const dates = e.target.value
                                  .split(",")
                                  .map((date) =>
                                    new Date(date.trim()).getTime()
                                  )
                                  .filter((date) => !isNaN(date));
                                field.onChange(dates);
                              }}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400 text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4">
              <Button
                type="submit"
                disabled={isCreating}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-red-600/90 to-orange-600/90 hover:from-red-500/90 hover:to-orange-500/90 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/15 disabled:transform-none disabled:shadow-none"
              >
                {isCreating ? "Creating Pool..." : "Create Pool"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
