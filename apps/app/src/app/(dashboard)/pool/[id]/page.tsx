"use client";

import { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";

export default function PoolDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-black p-4">
      {/* Top Analytics Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[11px] text-[#666]">TVL</span>
            <p className="text-white font-medium">$5.3M</p>
          </div>
          <div className="w-px h-8 bg-[#1a1a1a]" />
          <div>
            <span className="text-[11px] text-[#666]">Utilization</span>
            <p className="text-white font-medium">54%</p>
          </div>
          <div className="w-px h-8 bg-[#1a1a1a]" />
          <div>
            <span className="text-[11px] text-[#666]">Min hold</span>
            <p className="text-white font-medium">7 days</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1.5 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg">
            Daily NAV pricing
          </span>
          <span className="px-3 py-1.5 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg">
            On-chain treasuries
          </span>
          <span className="px-3 py-1.5 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg">
            Low duration exposure
          </span>
          <span className="px-3 py-1.5 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg">
            DAI deposits only
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Left Column - Main Content */}
        <div className="w-[65%] space-y-4">
          <NAVYieldHistory />
          <DepositFlow />
          <YourPositions />
          <PoolTransactionsTable />
          <AboutPoolCard />
        </div>

        {/* Right Column - Info Cards */}
        <div className="w-[35%] space-y-4">
          <APYCard />
          <PoolStatsCard />
          <AllocationCard />
          <HoldingExitsCard />
          <RiskCard />
        </div>
      </div>
    </div>
  );
}

function NAVYieldHistory() {
  const [activeTab, setActiveTab] = useState<"30D" | "90D" | "1Y">("30D");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const chartData = useMemo(() => {
    const points = activeTab === "30D" ? 30 : activeTab === "90D" ? 90 : 365;
    const data: { date: Date; nav: number; yield: number }[] = [];
    const baseNAV = 1.0;
    const now = new Date();

    for (let i = 0; i < points; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (points - i));
      const variance = (Math.random() - 0.5) * 0.003;
      const growth = (i / points) * 0.05;
      const nav = baseNAV + growth + variance;
      const yieldRate = 5.8 + Math.random() * 0.6;
      data.push({ date, nav, yield: yieldRate });
    }
    return data;
  }, [activeTab]);

  const { minNav, maxNav } = useMemo(() => {
    const navs = chartData.map((d) => d.nav);
    return { minNav: Math.min(...navs), maxNav: Math.max(...navs) };
  }, [chartData]);

  const pathData = useMemo(() => {
    const width = 100;
    const height = 100;
    const padding = 2;
    return chartData
      .map((d, i) => {
        const x = (i / (chartData.length - 1)) * (width - padding * 2) + padding;
        const y = height - padding - ((d.nav - minNav) / (maxNav - minNav)) * (height - padding * 2);
        return `${i === 0 ? "M" : "L"} ${x},${y}`;
      })
      .join(" ");
  }, [chartData, minNav, maxNav]);

  const areaPath = useMemo(() => {
    const width = 100;
    const height = 100;
    const padding = 2;
    const points = chartData.map((d, i) => {
      const x = (i / (chartData.length - 1)) * (width - padding * 2) + padding;
      const y = height - padding - ((d.nav - minNav) / (maxNav - minNav)) * (height - padding * 2);
      return `${x},${y}`;
    });
    return `M ${padding},${height - padding} L ${points.join(" L ")} L ${width - padding},${height - padding} Z`;
  }, [chartData, minNav, maxNav]);

  const currentNav = chartData[chartData.length - 1]?.nav ?? 1;
  const startNav = chartData[0]?.nav ?? 1;
  const navChange = ((currentNav - startNav) / startNav) * 100;

  const hoveredData = hoveredPoint !== null ? chartData[hoveredPoint] : null;

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-medium text-white">NAV & yield history</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-2xl font-semibold text-white">
              {hoveredData ? hoveredData.nav.toFixed(4) : currentNav.toFixed(4)} DAI
            </span>
            <span className={`text-[12px] ${navChange >= 0 ? "text-[#00c853]" : "text-red-400"}`}>
              {navChange >= 0 ? "+" : ""}{navChange.toFixed(2)}%
            </span>
          </div>
          {hoveredData && (
            <span className="text-[11px] text-[#666]">
              {hoveredData.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {(["30D", "90D", "1Y"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-[11px] rounded-lg transition-colors ${
                activeTab === tab
                  ? "bg-[#00c853] text-black"
                  : "text-[#666] hover:text-[#888]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="h-48 relative">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="navGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00c853" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00c853" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {[0, 25, 50, 75, 100].map((y) => (
            <line key={y} x1="2" y1={y} x2="98" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" />
          ))}

          <path d={areaPath} fill="url(#navGradient)" />
          <path d={pathData} fill="none" stroke="#00c853" strokeWidth="0.4" strokeLinecap="round" />

          {chartData.map((_, i) => {
            const width = 100;
            const padding = 2;
            const x = (i / (chartData.length - 1)) * (width - padding * 2) + padding;
            return (
              <rect
                key={i}
                x={x - 0.5}
                y="0"
                width="1"
                height="100"
                fill="transparent"
                onMouseEnter={() => setHoveredPoint(i)}
                style={{ cursor: "crosshair" }}
              />
            );
          })}

          {hoveredPoint !== null && (
            <>
              <line
                x1={(hoveredPoint / (chartData.length - 1)) * 96 + 2}
                y1="0"
                x2={(hoveredPoint / (chartData.length - 1)) * 96 + 2}
                y2="100"
                stroke="#00c853"
                strokeWidth="0.2"
                strokeDasharray="1,1"
              />
              <circle
                cx={(hoveredPoint / (chartData.length - 1)) * 96 + 2}
                cy={100 - 2 - ((chartData[hoveredPoint].nav - minNav) / (maxNav - minNav)) * 96}
                r="1"
                fill="#00c853"
              />
            </>
          )}
        </svg>

        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-[#444] py-1">
          <span>{maxNav.toFixed(4)}</span>
          <span>{((maxNav + minNav) / 2).toFixed(4)}</span>
          <span>{minNav.toFixed(4)}</span>
        </div>
      </div>

      <div className="flex justify-between text-[10px] text-[#444] mt-2">
        <span>{chartData[0]?.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        <span>{chartData[Math.floor(chartData.length / 2)]?.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        <span>{chartData[chartData.length - 1]?.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
      </div>

      <div className="flex items-center gap-6 text-[11px] mt-4 pt-4 border-t border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-[#00c853] rounded" />
          <span className="text-[#888]">NAV per share</span>
        </div>
        <span className="text-[#555]">Past performance is not a guarantee of future returns.</span>
      </div>
    </div>
  );
}

function DepositFlow() {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const [amount, setAmount] = useState("");
  const [isApproved, setIsApproved] = useState(false);

  const daiBalance = 1234.56;
  const sharePrice = 1.0387;
  const depositFee = 0.001;
  const apy = 6.1;

  const parsedAmount = parseFloat(amount) || 0;
  const shares = parsedAmount > 0 ? (parsedAmount * (1 - depositFee)) / sharePrice : 0;
  const estimatedYield = parsedAmount > 0 ? (parsedAmount * apy) / 100 : 0;
  const feeAmount = parsedAmount * depositFee;

  const canDeposit = isConnected && parsedAmount >= 50 && parsedAmount <= daiBalance;

  const handleMaxClick = () => {
    if (isConnected) {
      setAmount(daiBalance.toString());
    }
  };

  const handleAction = () => {
    if (!isConnected) {
      open();
    } else if (!isApproved) {
      setIsApproved(true);
    } else {
      console.log("Deposit", parsedAmount);
    }
  };

  const getButtonText = () => {
    if (!isConnected) return "Connect wallet to continue";
    if (parsedAmount === 0) return "Enter amount";
    if (parsedAmount < 50) return "Minimum 50 DAI";
    if (parsedAmount > daiBalance) return "Insufficient balance";
    if (!isApproved) return "Approve DAI";
    return "Deposit";
  };

  const isButtonDisabled = isConnected && (parsedAmount === 0 || parsedAmount < 50 || parsedAmount > daiBalance);

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-[10px] text-[#666] uppercase tracking-wider">Deposit</span>
          <h3 className="text-[16px] font-medium text-white">Fund the pool in a few clicks.</h3>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg">DAI only</span>
          <span className="px-3 py-1 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg">7 day hold</span>
        </div>
      </div>
      <p className="text-[12px] text-[#666] mb-5">
        {isConnected 
          ? "Enter an amount, review your estimated yield, and confirm the deposit."
          : "Connect your wallet to deposit DAI and start earning yield."
        }
      </p>

      <div className="max-w-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] text-[#888]">Amount</span>
          <span className="text-[12px] text-[#666]">
            Balance: {isConnected ? `${daiBalance.toLocaleString()} DAI` : "— DAI"}
          </span>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl border border-[#1a1a1a] bg-black focus-within:border-[#333] transition-colors">
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            className="flex-1 bg-transparent text-2xl text-white outline-none"
          />
          <button className="px-2 py-1 text-[10px] text-[#888] border border-[#1a1a1a] rounded">DAI</button>
          <button 
            onClick={handleMaxClick}
            className="px-2 py-1 text-[10px] text-[#888] border border-[#1a1a1a] rounded hover:text-white hover:border-[#333] transition-colors"
          >
            Max
          </button>
        </div>
        <p className="text-[11px] text-[#666] mt-1">≈ ${parsedAmount.toLocaleString()}</p>
        <p className="text-[11px] text-[#666] mt-3">Min deposit 50 DAI</p>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-[12px]">
            <span className="text-[#888]">Estimated 12-month yield</span>
            <span className="text-white">
              {parsedAmount > 0 ? `$${estimatedYield.toFixed(2)}` : "—"}
            </span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-[#888]">Deposit fee (0.10%)</span>
            <span className="text-white">
              {parsedAmount > 0 ? `$${feeAmount.toFixed(2)}` : "—"}
            </span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-[#888]">You receive (shares)</span>
            <span className="text-white">
              {parsedAmount > 0 ? `~${shares.toFixed(2)}` : "—"}
            </span>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={handleAction}
            disabled={isButtonDisabled}
            className={`px-5 py-2.5 text-[12px] font-medium rounded-full transition-colors ${
              isButtonDisabled
                ? "bg-[#1a1a1a] text-[#666] cursor-not-allowed"
                : "bg-[#00c853] text-black hover:bg-[#00b84a]"
            }`}
          >
            {getButtonText()}
          </button>
          <button className="px-4 py-2.5 text-[12px] text-[#888] border border-[#1a1a1a] rounded-full hover:text-white hover:border-[#333] transition-colors">
            View withdrawal policy
          </button>
        </div>
      </div>
    </div>
  );
}

function YourPositions() {
  const { isConnected } = useAccount();

  const positions = [
    { depositDate: "Mar 5, 2026", shares: 4821.23, value: 5008.45, unlockDate: "Mar 12, 2026", canWithdraw: true },
    { depositDate: "Mar 8, 2026", shares: 962.41, value: 999.85, unlockDate: "Mar 15, 2026", canWithdraw: false },
  ];

  if (!isConnected) {
    return (
      <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-medium text-white">Your positions</h3>
          <p className="text-[11px] text-[#666]">Connect a wallet to see deposits and exit eligibility.</p>
        </div>
      </div>
    );
  }

  const totalValue = positions.reduce((sum, p) => sum + p.value, 0);
  const totalShares = positions.reduce((sum, p) => sum + p.shares, 0);

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-medium text-white">Your positions</h3>
          <p className="text-[11px] text-[#666] mt-0.5">
            {positions.length} position{positions.length !== 1 ? "s" : ""} · {totalShares.toLocaleString()} shares · ${totalValue.toLocaleString()}
          </p>
        </div>
        <button className="px-3 py-1.5 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg hover:text-white hover:border-[#333] transition-colors">
          Withdraw all eligible
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4 text-[11px] text-[#666] border-b border-[#1a1a1a] pb-3">
        <span>Deposit date</span>
        <span>Shares</span>
        <span>Current value</span>
        <span>Hold status</span>
        <span></span>
      </div>

      {positions.map((position, i) => (
        <div key={i} className="grid grid-cols-5 gap-4 py-3 border-b border-[#1a1a1a] last:border-0 items-center">
          <span className="text-[12px] text-[#999]">{position.depositDate}</span>
          <span className="text-[12px] text-white">{position.shares.toLocaleString()}</span>
          <span className="text-[12px] text-white">${position.value.toLocaleString()}</span>
          <span className={`text-[11px] ${position.canWithdraw ? "text-[#00c853]" : "text-[#888]"}`}>
            {position.canWithdraw ? "Unlocked" : `Unlocks ${position.unlockDate}`}
          </span>
          <button
            disabled={!position.canWithdraw}
            className={`px-3 py-1 text-[11px] rounded-lg transition-colors ${
              position.canWithdraw
                ? "text-[#00c853] border border-[#00c853]/30 hover:bg-[#00c853]/10"
                : "text-[#444] border border-[#1a1a1a] cursor-not-allowed"
            }`}
          >
            Withdraw
          </button>
        </div>
      ))}
    </div>
  );
}

function APYCard() {
  const { isConnected } = useAccount();
  const { open } = useWeb3Modal();

  const userPosition = {
    shares: 5783.64,
    value: 6008.30,
    profit: 208.30,
    profitPercent: 3.6,
  };

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-[11px] text-[#666]">Current APY</span>
          <p className="text-[11px] text-[#666] mt-1">Variable, based on underlying yield.</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold text-[#00c853]">6.1%</p>
          <p className="text-[11px] text-[#666]">+0.3% vs 30-day average</p>
        </div>
      </div>

      {isConnected && (
        <div className="mb-4 p-3 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a]">
          <span className="text-[10px] text-[#666] uppercase tracking-wider">Your position</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-white">${userPosition.value.toLocaleString()}</span>
            <span className="text-[12px] text-[#00c853]">
              +${userPosition.profit.toFixed(2)} (+{userPosition.profitPercent}%)
            </span>
          </div>
          <p className="text-[11px] text-[#666] mt-1">{userPosition.shares.toLocaleString()} shares</p>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">Share price 1.0387</span>
        <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">NAV refresh: daily</span>
      </div>

      <div className="flex gap-3 mb-4">
        {isConnected ? (
          <>
            <button className="flex-1 px-4 py-2.5 bg-[#00c853] text-black text-[12px] font-medium rounded-full hover:bg-[#00b84a] transition-colors">
              Deposit more
            </button>
            <button className="flex-1 px-4 py-2.5 text-[12px] text-[#888] border border-[#1a1a1a] rounded-full hover:text-white hover:border-[#333] transition-colors">
              Withdraw
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => open()}
              className="flex-1 px-4 py-2.5 bg-[#00c853] text-black text-[12px] font-medium rounded-full hover:bg-[#00b84a] transition-colors"
            >
              Connect wallet
            </button>
            <button className="flex-1 px-4 py-2.5 text-[12px] text-[#888] border border-[#1a1a1a] rounded-full hover:text-white hover:border-[#333] transition-colors">
              Simulate deposit
            </button>
          </>
        )}
      </div>

      <p className="text-[11px] text-[#666]">
        {isConnected
          ? "Yield accrues daily. Withdraw eligible positions anytime after the 7-day hold."
          : "Connect a wallet to see your positions and start earning yield in this pool."
        }
      </p>
    </div>
  );
}

function PoolStatsCard() {
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
      <h3 className="text-[13px] font-medium text-white mb-0.5">Pool stats</h3>
      <p className="text-[11px] text-[#666] mb-4">Key numbers for DeFi Treasury Blend.</p>

      <div className="space-y-2.5">
        <div className="flex justify-between text-[12px]">
          <span className="text-[#888]">TVL</span>
          <span className="text-white">$5.3M</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#888]">Utilization</span>
          <span className="text-white">54%</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#888]">Reserves</span>
          <span className="text-white">$2.4M</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#888]">NAV per share</span>
          <span className="text-white">1.0387 DAI</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">StableYieldPool</span>
        <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">Escrow separation</span>
        <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">Access-controlled manager</span>
      </div>
    </div>
  );
}

function AllocationCard() {
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
      <h3 className="text-[13px] font-medium text-white mb-0.5">Underlying allocation</h3>
      <p className="text-[11px] text-[#666] mb-4">Indicative split across instruments.</p>

      <div className="space-y-2.5">
        <div className="flex justify-between text-[12px]">
          <span className="text-[#888]">On-chain treasuries</span>
          <span className="text-white">48%</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#888]">Money market funds</span>
          <span className="text-white">32%</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#888]">Cash buffer</span>
          <span className="text-white">20%</span>
        </div>
      </div>

      <div className="border-t border-[#1a1a1a] mt-4 pt-4 space-y-2.5">
        <div className="flex justify-between text-[12px]">
          <span className="text-[#666]">Average duration</span>
          <span className="text-[#888]">&lt; 45 days</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#666]">Next NAV event</span>
          <span className="text-[#888]">In ~6 hours</span>
        </div>
      </div>
    </div>
  );
}

function HoldingExitsCard() {
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
      <h3 className="text-[13px] font-medium text-white mb-0.5">Holding & exits</h3>
      <p className="text-[11px] text-[#666] mb-4">How capital moves in and out of the pool.</p>

      <div className="space-y-2.5">
        <div className="flex justify-between text-[12px]">
          <span className="text-[#888]">Minimum holding period</span>
          <span className="text-white">7 days</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#888]">Withdrawal model</span>
          <span className="text-white">Instant if reserves, else queue</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#888]">Withdrawal fee</span>
          <span className="text-white">0.15%</span>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">Queue visible in app</span>
        <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">No lockup after 7 days</span>
      </div>
    </div>
  );
}

function RiskCard() {
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
      <h3 className="text-[13px] font-medium text-white mb-0.5">Risk & disclosures</h3>
      <p className="text-[11px] text-[#666] mb-4">Understand how this pool behaves under stress.</p>

      <div className="space-y-2.5">
        <div className="flex justify-between text-[12px]">
          <span className="text-[#888]">Primary risks</span>
          <span className="text-white">Rate, Counterparty</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#888]">Compliance</span>
          <span className="text-white">KYC/AML where required</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#888]">Docs</span>
          <span className="text-white">Risk memo →</span>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button className="px-3 py-1.5 text-[11px] text-[#888] border border-[#1a1a1a] rounded-full hover:text-white hover:border-[#333] transition-colors">
          View full disclosures
        </button>
        <button className="px-3 py-1.5 text-[11px] text-[#888] border border-[#1a1a1a] rounded-full hover:text-white hover:border-[#333] transition-colors">
          Tax & reporting
        </button>
      </div>
    </div>
  );
}

function AboutPoolCard() {
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
      <h3 className="text-[15px] font-medium text-white mb-1">About this Pool</h3>
      <p className="text-[13px] text-[#999] mb-5">
        Diversified portfolio of African and European securities
      </p>

      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        <div className="flex justify-between text-[12px]">
          <span className="text-[#666]">Pool Type</span>
          <span className="text-white">Stable Yield</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#666]">Security Type</span>
          <span className="text-white">Money Market Fund</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#666]">Risk Rating</span>
          <span className="text-white">A+</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#666]">Issuer</span>
          <span className="text-white">Piron Finance</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#666]">Region</span>
          <span className="text-white">Global</span>
        </div>
      </div>

      <div className="flex gap-2 mt-5">
        <button className="px-3 py-1.5 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg hover:text-white hover:border-[#333] transition-colors">
          Strategy docs
        </button>
        <button className="px-3 py-1.5 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg hover:text-white hover:border-[#333] transition-colors">
          Smart contracts
        </button>
        <button className="px-3 py-1.5 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg hover:text-white hover:border-[#333] transition-colors">
          Audit report
        </button>
      </div>
    </div>
  );
}

function PoolTransactionsTable() {
  const [filter, setFilter] = useState<"all" | "deposits" | "withdrawals">("all");

  const transactions = [
    { time: "Dec 17, 06:32 PM", type: "DEPOSIT" as const, user: "0xfeed...413c", amount: "18,800 E20M", hash: "0x17b2...8830" },
    { time: "Dec 17, 05:46 PM", type: "DEPOSIT" as const, user: "0xfeed...413c", amount: "6,700 E20M", hash: "0xb984...f121" },
    { time: "Dec 17, 05:15 PM", type: "WITHDRAW" as const, user: "0x3a1f...8c2d", amount: "2,100 E20M", hash: "0x6be9...4a5d" },
    { time: "Dec 7, 02:06 PM", type: "DEPOSIT" as const, user: "0xfeed...413c", amount: "28,700 E20M", hash: "0x12a0...95e6" },
    { time: "Nov 26, 05:22 AM", type: "DEPOSIT" as const, user: "0x6e91...d2a5", amount: "1,300 E20M", hash: "0x16a1...1aec" },
    { time: "Nov 26, 03:45 AM", type: "WITHDRAW" as const, user: "0xfeed...413c", amount: "500 E20M", hash: "0xf3f3...c254" },
  ];

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true;
    if (filter === "deposits") return tx.type === "DEPOSIT";
    if (filter === "withdrawals") return tx.type === "WITHDRAW";
    return true;
  });

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-medium text-white">Pool transactions</h3>
        <div className="flex gap-1">
          {(["all", "deposits", "withdrawals"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-[11px] rounded-lg transition-colors capitalize ${
                filter === f ? "bg-[#1a1a1a] text-white" : "text-[#666] hover:text-[#888]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr className="text-[11px] text-[#666] border-b border-[#1a1a1a]">
            <th className="text-left font-normal pb-3">Time</th>
            <th className="text-left font-normal pb-3">Type</th>
            <th className="text-left font-normal pb-3">User</th>
            <th className="text-left font-normal pb-3">Amount</th>
            <th className="text-left font-normal pb-3">Hash</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((tx, index) => (
            <tr key={index} className="border-b border-[#1a1a1a] last:border-0">
              <td className="py-3 text-[12px] text-[#999]">{tx.time}</td>
              <td className="py-3">
                <span
                  className={`px-2 py-1 text-[10px] font-medium rounded ${
                    tx.type === "DEPOSIT"
                      ? "bg-[#1a1a1a] text-white"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {tx.type}
                </span>
              </td>
              <td className="py-3 text-[12px] text-[#999] font-mono">{tx.user}</td>
              <td className="py-3 text-[12px] text-white font-medium">{tx.amount}</td>
              <td className="py-3">
                <a
                  href={`https://etherscan.io/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-[#00c853] font-mono hover:underline"
                >
                  {tx.hash}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-center mt-4">
        <button className="px-4 py-2 text-[11px] text-[#666] hover:text-[#888] transition-colors">
          Load more transactions
        </button>
      </div>
    </div>
  );
}
