"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Briefcase,
  Receipt,
  ArrowRight,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate, formatPercentage } from "@/lib/utils";

const mockSPVData = {
  totalFundsManaged: "12500000",
  activeInvestments: 8,
  pendingWithdrawals: 3,
  pendingInvestmentConfirmations: 2,
  pendingCoupons: 5,
  poolsNearingMaturity: 1,
  totalReturnsGenerated: "1850000",
  averageROI: 12.4,
};

const pendingActions = [
  {
    id: "1",
    type: "withdrawal",
    poolName: "US Treasury Bills Q4 2024",
    amount: "2500000",
    requestDate: Date.now() - 86400000,
    priority: "high",
  },
  {
    id: "2",
    type: "investment_confirmation",
    poolName: "Corporate Bonds Series A",
    amount: "1800000",
    requestDate: Date.now() - 172800000,
    priority: "medium",
  },
  {
    id: "3",
    type: "coupon",
    poolName: "Municipal Bonds 2024",
    amount: "125000",
    dueDate: Date.now() + 604800000,
    priority: "medium",
  },
  {
    id: "4",
    type: "maturity",
    poolName: "Short-term Notes Q3",
    amount: "3200000",
    maturityDate: Date.now() + 1209600000,
    priority: "low",
  },
];

const recentInvestments = [
  {
    poolName: "US Treasury Bills Q4 2024",
    amount: "2500000",
    investmentDate: Date.now() - 604800000,
    status: "confirmed",
    roi: 8.2,
  },
  {
    poolName: "Corporate Bonds Series A",
    amount: "1800000",
    investmentDate: Date.now() - 1209600000,
    status: "processing",
    roi: 0,
  },
  {
    poolName: "Municipal Bonds 2024",
    amount: "3100000",
    investmentDate: Date.now() - 2419200000,
    status: "confirmed",
    roi: 15.7,
  },
];

function getPriorityColor(priority: string) {
  switch (priority) {
    case "high":
      return "bg-red-500/20 text-red-300 border-red-500/30";
    case "medium":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    case "low":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  }
}

function getActionIcon(type: string) {
  switch (type) {
    case "withdrawal":
      return DollarSign;
    case "investment_confirmation":
      return CheckCircle;
    case "coupon":
      return Receipt;
    case "maturity":
      return Clock;
    default:
      return FileText;
  }
}

function getActionLabel(type: string) {
  switch (type) {
    case "withdrawal":
      return "Fund Withdrawal";
    case "investment_confirmation":
      return "Investment Confirmation";
    case "coupon":
      return "Coupon Payment";
    case "maturity":
      return "Pool Maturity";
    default:
      return "Action Required";
  }
}

export default function SPVDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Total Funds Managed
            </CardTitle>
            <Briefcase className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(mockSPVData.totalFundsManaged)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Across {mockSPVData.activeInvestments} active investments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Pending Actions
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {pendingActions.length}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {pendingActions.filter((a) => a.priority === "high").length} high
              priority
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Returns Generated
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(mockSPVData.totalReturnsGenerated)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {formatPercentage(mockSPVData.averageROI)} average ROI
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Active Investments
            </CardTitle>
            <Building2 className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {mockSPVData.activeInvestments}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {mockSPVData.poolsNearingMaturity} nearing maturity
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Pending Actions</CardTitle>
              <Badge variant="outline" className="text-xs">
                {pendingActions.length} items
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingActions.map((action) => {
              const Icon = getActionIcon(action.type);
              return (
                <div
                  key={action.id}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/5"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {getActionLabel(action.type)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {action.poolName}
                      </p>
                      <p className="text-xs font-medium text-green-400">
                        {formatCurrency(action.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getPriorityColor(action.priority)}`}
                    >
                      {action.priority}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-white"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            <div className="pt-2">
              <Button
                asChild
                variant="outline"
                className="w-full border-white/20 hover:border-white/40"
              >
                <Link href="/spv/withdrawals">
                  View All Actions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Recent Investments</CardTitle>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <Link href="/spv/reports">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentInvestments.map((investment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/5"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">
                    {investment.poolName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDate(investment.investmentDate)}
                  </p>
                  <p className="text-xs font-medium text-green-400">
                    {formatCurrency(investment.amount)}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Badge
                    variant="outline"
                    className={
                      investment.status === "confirmed"
                        ? "bg-green-500/20 text-green-300 border-green-500/30"
                        : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                    }
                  >
                    {investment.status}
                  </Badge>
                  {investment.roi > 0 && (
                    <p className="text-xs font-medium text-blue-400">
                      {formatPercentage(investment.roi)} ROI
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          asChild
          className="h-16 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
        >
          <Link
            href="/spv/withdrawals"
            className="flex flex-col items-center space-y-1"
          >
            <DollarSign className="w-6 h-6" />
            <span className="text-sm font-medium">Process Withdrawals</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="h-16 border-white/20 hover:border-white/40"
        >
          <Link
            href="/spv/investments"
            className="flex flex-col items-center space-y-1"
          >
            <CheckCircle className="w-6 h-6" />
            <span className="text-sm font-medium">Confirm Investments</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="h-16 border-white/20 hover:border-white/40"
        >
          <Link
            href="/spv/coupons"
            className="flex flex-col items-center space-y-1"
          >
            <Receipt className="w-6 h-6" />
            <span className="text-sm font-medium">Submit Coupons</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="h-16 border-white/20 hover:border-white/40"
        >
          <Link
            href="/spv/reports"
            className="flex flex-col items-center space-y-1"
          >
            <FileText className="w-6 h-6" />
            <span className="text-sm font-medium">View Reports</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
