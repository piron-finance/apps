import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Simplified pool card - no longer using Convex types
interface PoolCardProps {
  pool: any;
  showInvestButton?: boolean;
}

export function PoolCard({ pool }: PoolCardProps) {
  return (
    <Link href={`/pools/${pool.id}`}>
      <Card className="bg-slate-900/50 hover:bg-slate-900/70 border-white/20 cursor-pointer">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-white line-clamp-2">
              {pool.name}
            </h3>
            <Badge className="flex-shrink-0">{pool.status}</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 line-clamp-2">
            {pool.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
