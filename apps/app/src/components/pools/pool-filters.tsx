import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { PoolStatus, InstrumentType, RiskLevel } from "@/types";
import { getPoolStatusLabel, getInstrumentTypeLabel } from "@/lib/utils";

export interface PoolFilters {
  search: string;
  status: PoolStatus | "all";
  instrumentType: InstrumentType | "all";
  riskLevel: RiskLevel | "all";
  minAPY: string;
  maxAPY: string;
}

interface PoolFiltersProps {
  filters: PoolFilters;
  onFiltersChange: (filters: PoolFilters) => void;
  activePoolsCount?: number;
  totalPoolsCount?: number;
}

export function PoolFiltersComponent({
  filters,
  onFiltersChange,
  activePoolsCount,
  totalPoolsCount,
}: PoolFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof PoolFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: "all",
      instrumentType: "all",
      riskLevel: "all",
      minAPY: "",
      maxAPY: "",
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.instrumentType !== "all" ||
    filters.riskLevel !== "all" ||
    filters.minAPY ||
    filters.maxAPY;

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status !== "all") count++;
    if (filters.instrumentType !== "all") count++;
    if (filters.riskLevel !== "all") count++;
    if (filters.minAPY) count++;
    if (filters.maxAPY) count++;
    return count;
  };

  return (
    <div className="space-y-4 p-4 bg-slate-900/50 rounded-lg border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <h3 className="font-medium text-white">Filters</h3>
          {hasActiveFilters && (
            <Badge variant="outline" className="text-xs">
              {getActiveFilterCount()} active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {totalPoolsCount && (
            <span className="text-sm text-slate-400">
              {activePoolsCount || 0} of {totalPoolsCount} pools
            </span>
          )}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search pools by name, issuer, or description..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
        />
      </div>

      {/* Quick Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Status
          </label>
          <Select
            value={filters.status.toString()}
            onValueChange={(value) => updateFilter("status", value)}
          >
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value={PoolStatus.FUNDING.toString()}>
                {getPoolStatusLabel(PoolStatus.FUNDING)}
              </SelectItem>
              <SelectItem value={PoolStatus.PENDING_INVESTMENT.toString()}>
                {getPoolStatusLabel(PoolStatus.PENDING_INVESTMENT)}
              </SelectItem>
              <SelectItem value={PoolStatus.INVESTED.toString()}>
                {getPoolStatusLabel(PoolStatus.INVESTED)}
              </SelectItem>
              <SelectItem value={PoolStatus.MATURED.toString()}>
                {getPoolStatusLabel(PoolStatus.MATURED)}
              </SelectItem>
              <SelectItem value={PoolStatus.EMERGENCY.toString()}>
                {getPoolStatusLabel(PoolStatus.EMERGENCY)}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Instrument Type
          </label>
          <Select
            value={filters.instrumentType.toString()}
            onValueChange={(value) => updateFilter("instrumentType", value)}
          >
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={InstrumentType.DISCOUNTED.toString()}>
                {getInstrumentTypeLabel(InstrumentType.DISCOUNTED)}
              </SelectItem>
              <SelectItem value={InstrumentType.INTEREST_BEARING.toString()}>
                {getInstrumentTypeLabel(InstrumentType.INTEREST_BEARING)}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Risk Level
          </label>
          <Select
            value={filters.riskLevel}
            onValueChange={(value) => updateFilter("riskLevel", value)}
          >
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value={RiskLevel.LOW}>Low Risk</SelectItem>
              <SelectItem value={RiskLevel.MEDIUM}>Medium Risk</SelectItem>
              <SelectItem value={RiskLevel.HIGH}>High Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-slate-400 hover:text-white"
      >
        {showAdvanced ? "Hide" : "Show"} Advanced Filters
      </Button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-700">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Min APY (%)
            </label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minAPY}
              onChange={(e) => updateFilter("minAPY", e.target.value)}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Max APY (%)
            </label>
            <Input
              type="number"
              placeholder="100"
              value={filters.maxAPY}
              onChange={(e) => updateFilter("maxAPY", e.target.value)}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
            />
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700">
          {filters.search && (
            <Badge
              variant="secondary"
              className="bg-purple-500/20 text-purple-300 border-purple-500/30"
            >
              Search: {filters.search}
              <button
                onClick={() => updateFilter("search", "")}
                className="ml-1 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.status !== "all" && (
            <Badge
              variant="secondary"
              className="bg-blue-500/20 text-blue-300 border-blue-500/30"
            >
              Status: {getPoolStatusLabel(filters.status as PoolStatus)}
              <button
                onClick={() => updateFilter("status", "all")}
                className="ml-1 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.instrumentType !== "all" && (
            <Badge
              variant="secondary"
              className="bg-green-500/20 text-green-300 border-green-500/30"
            >
              Type:{" "}
              {getInstrumentTypeLabel(filters.instrumentType as InstrumentType)}
              <button
                onClick={() => updateFilter("instrumentType", "all")}
                className="ml-1 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.riskLevel !== "all" && (
            <Badge
              variant="secondary"
              className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
            >
              Risk: {filters.riskLevel}
              <button
                onClick={() => updateFilter("riskLevel", "all")}
                className="ml-1 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
