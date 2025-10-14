import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { Doc } from "../../../convex/_generated/dataModel";
import {
  formatCurrency,
  formatTimeRemaining,
  formatDate,
  formatPercentage,
  getPoolStatusColor,
  getPoolStatusLabel,
  getRiskLevelColor,
  getInstrumentTypeLabel,
  isPoolActive,
  canUserWithdraw,
} from "@/lib/utils";

type EnhancedPool = Doc<"pools"> & {
  totalRaisedNumeric: number;
  targetRaiseNumeric: number;
  couponRatesNumeric: number[];
  progressPercentage: number;
  expectedAPY: number;
  poolWeight: number;
  isActivePool: boolean;
};

interface PoolCardProps {
  pool: EnhancedPool;
  userPosition?: {
    sharesOwned: string;
    currentValue: string;
    expectedReturn: string;
  };
  showInvestButton?: boolean;
  compact?: boolean;
}

export function PoolCard({
  pool,
  userPosition,
  showInvestButton = true,
  compact = false,
}: PoolCardProps) {
  const fundingProgress = pool.progressPercentage;
  const epochMs =
    pool.epochEndTime > 1e12 ? pool.epochEndTime : pool.epochEndTime * 1000;
  const maturityMs =
    pool.maturityDate > 1e12 ? pool.maturityDate : pool.maturityDate * 1000;
  const timeRemaining = formatTimeRemaining(epochMs);
  const isActive = isPoolActive(pool);
  const canWithdraw = canUserWithdraw(pool);

  const expectedAPY = pool.expectedAPY;

  return (
    <Card className="bg-slate-900/50 border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
      <CardHeader className={compact ? "pb-3" : "pb-4"}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold text-white">
              {pool.name}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={`${getPoolStatusColor(pool.status)} text-xs`}
              >
                {getPoolStatusLabel(pool.status)}
              </Badge>
              <Badge
                variant="outline"
                className={`${getRiskLevelColor(pool.riskLevel)} text-xs`}
              >
                {pool.riskLevel} Risk
              </Badge>
              <Badge
                variant="outline"
                className="text-xs text-slate-300 border-slate-600"
              >
                {getInstrumentTypeLabel(pool.instrumentType)}
              </Badge>
            </div>
          </div>
          {!isActive && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-slate-400">Expected APY</span>
            </div>
            <p className="text-lg font-semibold text-green-400">
              {formatPercentage(expectedAPY)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400">Min Investment</span>
            </div>
            <p className="text-lg font-semibold text-white">
              {formatCurrency(pool.minInvestment || "0")}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Funding Progress</span>
            <span className="text-sm font-medium text-white">
              {formatPercentage(fundingProgress)}
            </span>
          </div>
          <Progress
            value={Math.min(fundingProgress, 100)}
            className="h-2 bg-slate-700/60"
            indicatorClassName="from-purple-400 to-pink-400"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>{formatCurrency(pool.totalRaised)} raised</span>
            <span>{formatCurrency(pool.targetRaise)} target</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400">Time Remaining</span>
            </div>
            <p className="font-medium text-white">{timeRemaining}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400">Maturity</span>
            </div>
            <p className="font-medium text-white">{formatDate(maturityMs)}</p>
          </div>
        </div>

        {userPosition && (
          <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
            <h4 className="text-sm font-medium text-white">Your Position</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-400">Current Value</span>
                <p className="font-semibold text-green-400">
                  {formatCurrency(userPosition.currentValue)}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Expected Return</span>
                <p className="font-semibold text-blue-400">
                  {formatCurrency(userPosition.expectedReturn)}
                </p>
              </div>
            </div>
          </div>
        )}

        {!compact && pool.description && (
          <p className="text-sm text-slate-300 line-clamp-2">
            {pool.description}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 border-white/20 hover:border-white/40"
          >
            <Link href={`/pools/${pool._id}`}>
              View Details
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>

          {showInvestButton && isActive && (
            <Button
              asChild
              size="sm"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Link href={`/pools/${pool._id}/invest`}>Invest Now</Link>
            </Button>
          )}

          {userPosition && canWithdraw && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
            >
              <Link href={`/pools/${pool._id}/withdraw`}>Withdraw</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
