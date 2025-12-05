"use client";

import { useMemo } from "react";

interface NAVDataPoint {
  timestamp: string;
  navPerShare: string;
}

interface NAVChartProps {
  data: NAVDataPoint[];
  timeframe: string;
}

export default function NAVChart({ data, timeframe }: NAVChartProps) {
  // Generate sample data if no real data is provided
  const chartData = useMemo(() => {
    if (data && data.length > 0) {
      return data;
    }

    // Generate sample NAV data for demonstration
    const sampleData: NAVDataPoint[] = [];
    const now = new Date();
    const points = timeframe === "1M" ? 30 : timeframe === "3M" ? 90 : timeframe === "1Y" ? 365 : 365;
    const baseNAV = 1.0;
    
    for (let i = 0; i < points; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (points - i));
      
      // Generate slightly increasing NAV with some variance
      const variance = (Math.random() - 0.5) * 0.002;
      const growth = (i / points) * 0.05; // 5% growth over period
      const nav = baseNAV + growth + variance;
      
      sampleData.push({
        timestamp: date.toISOString(),
        navPerShare: nav.toFixed(4),
      });
    }
    
    return sampleData;
  }, [data, timeframe]);

  const { minNAV, maxNAV, navValues } = useMemo(() => {
    const values = chartData.map((d) => parseFloat(d.navPerShare));
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return {
      minNAV: min,
      maxNAV: max,
      navValues: values,
    };
  }, [chartData]);

  const width = 100; // percentage
  const height = 100; // percentage
  const padding = 5;

  // Generate SVG path
  const pathData = useMemo(() => {
    if (navValues.length === 0) return "";

    const points = navValues.map((value, index) => {
      const x = (index / (navValues.length - 1)) * (width - padding * 2) + padding;
      const y = height - padding - ((value - minNAV) / (maxNAV - minNAV)) * (height - padding * 2);
      return `${x},${y}`;
    });

    return `M ${points.join(" L ")}`;
  }, [navValues, minNAV, maxNAV]);

  // Generate gradient area path
  const areaPathData = useMemo(() => {
    if (navValues.length === 0) return "";

    const points = navValues.map((value, index) => {
      const x = (index / (navValues.length - 1)) * (width - padding * 2) + padding;
      const y = height - padding - ((value - minNAV) / (maxNAV - minNAV)) * (height - padding * 2);
      return `${x},${y}`;
    });

    const firstX = padding;
    const lastX = (width - padding);
    const bottomY = height - padding;

    return `M ${firstX},${bottomY} L ${points.join(" L ")} L ${lastX},${bottomY} Z`;
  }, [navValues, minNAV, maxNAV]);

  const currentNAV = navValues[navValues.length - 1];
  const previousNAV = navValues[0];
  const navChange = currentNAV - previousNAV;
  const navChangePercent = ((navChange / previousNAV) * 100).toFixed(2);
  const isPositive = navChange >= 0;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="mb-3 flex-shrink-0">
        <div className="text-xl sm:text-2xl font-bold text-white">
          ${currentNAV.toFixed(4)}
        </div>
        <div className={`text-xs sm:text-sm ${isPositive ? "text-[#00c48c]" : "text-red-400"}`}>
          {isPositive ? "+" : ""}
          {navChangePercent}% ({timeframe})
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="navGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00c48c" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00c48c" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="0.2"
            />
          ))}

          {/* Area fill */}
          <path
            d={areaPathData}
            fill="url(#navGradient)"
          />

          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#00c48c"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dot at the end */}
          {navValues.length > 0 && (
            <circle
              cx={(width - padding)}
              cy={height - padding - ((currentNAV - minNAV) / (maxNAV - minNAV)) * (height - padding * 2)}
              r="1"
              fill="#00c48c"
            />
          )}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] sm:text-xs text-gray-500 pr-2">
          <span>${maxNAV.toFixed(4)}</span>
          <span>${((maxNAV + minNAV) / 2).toFixed(4)}</span>
          <span>${minNAV.toFixed(4)}</span>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mt-2 flex-shrink-0">
        <span>
          {new Date(chartData[0]?.timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
        <span className="hidden sm:inline">
          {new Date(chartData[Math.floor(chartData.length / 2)]?.timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
        <span>
          {new Date(chartData[chartData.length - 1]?.timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}

