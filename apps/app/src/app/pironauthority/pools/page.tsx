"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Users,
  Building2,
  Target,
  RefreshCw,
  Download,
  Loader2,
} from "lucide-react";
import {
  formatCurrency,
  getPoolStatusColor,
  getPoolStatusLabel,
} from "@/lib/utils";
import { Doc } from "../../../../convex/_generated/dataModel";

type EnhancedPool = Doc<"pools"> & {
  totalRaisedNumeric: number;
  targetRaiseNumeric: number;
  couponRatesNumeric: number[];
  progressPercentage: number;
  expectedAPY: number;
  poolWeight: number;
  isActivePool: boolean;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "FUNDING":
      return Clock;
    case "PENDING_INVESTMENT":
      return AlertCircle;
    case "INVESTED":
      return CheckCircle;
    case "MATURED":
      return Target;
    case "EMERGENCY":
      return AlertCircle;
    default:
      return Clock;
  }
};

export default function ManagePoolsPage() {
  const { isSignedIn, user } = useUser();

  const adminCheck = useQuery(
    api.admins.checkAdminByEmail,
    isSignedIn && user?.emailAddresses?.[0]?.emailAddress
      ? { email: user.emailAddresses[0].emailAddress }
      : "skip"
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedPools, setSelectedPools] = useState<string[]>([]);

  const pools = useQuery(api.pools.getAllPoolsWithComputed, {}) as
    | EnhancedPool[]
    | undefined;

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredPools = pools
    ? pools.filter((pool) => {
        const matchesSearch =
          pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pool.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (pool.symbol &&
            pool.symbol.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus =
          statusFilter === "all" ||
          getPoolStatusLabel(pool.status).toLowerCase() ===
            statusFilter.toLowerCase();

        const poolCategory =
          pool.instrumentType === "DISCOUNTED" ? "government" : "corporate";
        const matchesCategory =
          categoryFilter === "all" ||
          poolCategory === categoryFilter.toLowerCase();

        return matchesSearch && matchesStatus && matchesCategory;
      })
    : [];

  const updatePoolStatus = useMutation(api.pools.updateStatus);

  const handlePoolAction = async (poolId: string, action: string) => {
    if (!adminCheck?.admin?._id) return;

    try {
      switch (action) {
        case "pause":
          await updatePoolStatus({
            poolId: poolId as Id<"pools">,
            status: "EMERGENCY",
            adminId: adminCheck?.admin?._id,
          });
          break;
        case "activate":
          await updatePoolStatus({
            poolId: poolId as Id<"pools">,
            status: "FUNDING",
            adminId: adminCheck?.admin?._id,
          });
          break;
        case "emergency":
          await updatePoolStatus({
            poolId: poolId as Id<"pools">,
            status: "EMERGENCY",
            adminId: adminCheck?.admin?._id,
          });
          break;
        case "edit":
          window.location.href = `/pironauthority/pools/${poolId}/edit`;
          break;
        default:
          console.log(`Action ${action} not implemented yet`);
      }
    } catch (error) {
      console.error(`Error performing ${action} on pool ${poolId}:`, error);
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Performing bulk ${action} on pools:`, selectedPools);
    setSelectedPools([]);
  };

  const togglePoolSelection = (poolId: string) => {
    setSelectedPools((prev) =>
      prev.includes(poolId)
        ? prev.filter((id) => id !== poolId)
        : [...prev, poolId]
    );
  };

  const selectAllPools = () => {
    setSelectedPools(
      selectedPools.length === filteredPools.length
        ? []
        : filteredPools.map((pool) => pool._id)
    );
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-3">Manage Pools</h1>
          <p className="text-lg text-slate-400">
            Monitor and manage all investment pools
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30 rounded-xl text-slate-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30 rounded-xl text-slate-300 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <Link
            href="/admin/pools/create"
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600/90 to-orange-600/90 hover:from-red-500/90 hover:to-orange-500/90 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/15"
          >
            <Plus className="w-5 h-5" />
            <span>Create Pool</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/40 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-400/80" />
            </div>
            <div className="text-slate-400 text-sm">Total</div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {pools ? pools.length : 0}
          </div>
          <div className="text-sm text-slate-400">Total Pools</div>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/40 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400/80" />
            </div>
            <div className="text-slate-400 text-sm">TVL</div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {pools
              ? formatCurrency(
                  pools
                    .reduce(
                      (sum: number, pool) =>
                        sum + parseFloat(pool.totalRaised || "0"),
                      0
                    )
                    .toString()
                )
              : "$0"}
          </div>
          <div className="text-sm text-slate-400">Total Value Locked</div>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/40 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-400/80" />
            </div>
            <div className="text-slate-400 text-sm">Users</div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {pools ? pools.filter((p) => p.status === "FUNDING").length : 0}
          </div>
          <div className="text-sm text-slate-400">Funding Pools</div>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/40 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400/80" />
            </div>
            <div className="text-slate-400 text-sm">Funding</div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {pools ? pools.filter((p) => p.status === "MATURED").length : 0}
          </div>
          <div className="text-sm text-slate-400">Completed Pools</div>
        </div>
      </div>

      <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/40 rounded-3xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search pools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-900/30 border border-slate-600/20 rounded-xl text-slate-200 placeholder-slate-500 focus:border-orange-500/50 focus:outline-none w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-slate-900/30 border border-slate-600/20 rounded-xl text-slate-200 focus:border-orange-500/50 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="FUNDING">Funding</option>
              <option value="PENDING_INVESTMENT">Pending Investment</option>
              <option value="INVESTED">Invested</option>
              <option value="MATURED">Matured</option>
              <option value="EMERGENCY">Emergency</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-slate-900/30 border border-slate-600/20 rounded-xl text-slate-200 focus:border-orange-500/50 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Government">Government</option>
              <option value="Corporate">Corporate</option>
              <option value="Commercial">Commercial</option>
              <option value="Banking">Banking</option>
            </select>
          </div>

          {selectedPools.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">
                {selectedPools.length} selected
              </span>
              <button
                onClick={() => handleBulkAction("pause")}
                className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm"
              >
                Pause
              </button>
              <button
                onClick={() => handleBulkAction("activate")}
                className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
              >
                Activate
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/40 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50 border-b border-slate-700/40">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedPools.length === filteredPools.length &&
                      filteredPools.length > 0
                    }
                    onChange={selectAllPools}
                    className="rounded border-slate-600 bg-slate-800 text-orange-500 focus:ring-orange-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                  Pool
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                  Progress
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                  Raised
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                  Investors
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                  Maturity
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {pools === undefined ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                      <span className="text-slate-400">Loading pools...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPools.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-slate-400">
                      {pools.length === 0
                        ? "No pools found"
                        : "No pools match your filters"}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPools.map((pool) => {
                  const StatusIcon = getStatusIcon(pool.status);
                  const isSelected = selectedPools.includes(pool._id);
                  const fundingProgress = pool.progressPercentage;

                  return (
                    <tr
                      key={pool._id}
                      className={`hover:bg-slate-700/20 transition-colors ${
                        isSelected ? "bg-slate-700/30" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => togglePoolSelection(pool._id)}
                          className="rounded border-slate-600 bg-slate-800 text-orange-500 focus:ring-orange-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-orange-400/80" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-200">
                              {pool.name}
                            </div>
                            <div className="text-sm text-slate-400">
                              {pool.issuer}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-semibold ${getPoolStatusColor(pool.status)}`}
                        >
                          <StatusIcon className="w-4 h-4" />
                          <span>{getPoolStatusLabel(pool.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-24">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-slate-400">
                              {fundingProgress}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-700/50 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(fundingProgress, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-slate-200">
                            {formatCurrency(pool.totalRaised)}
                          </div>
                          <div className="text-sm text-slate-400">
                            of {formatCurrency(pool.targetRaise)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-200">N/A</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-400">
                          {new Date(
                            pool.maturityDate * 1000
                          ).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/pironauthority/pools/${pool._id}`}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handlePoolAction(pool._id, "edit")}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                            title="Edit Pool"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handlePoolAction(
                                pool._id,
                                pool.isActive ? "pause" : "activate"
                              )
                            }
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                            title={
                              pool.isActive ? "Pause Pool" : "Activate Pool"
                            }
                          >
                            {pool.isActive ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
