import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-4">
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
          <span className="text-white font-bold text-lg">π</span>
        </div>
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 animate-pulse" />
      </div>
      <div>
        <span className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
          Piron Finance
        </span>
        <div className="text-xs text-purple-300 font-medium">
          TOKENIZED MARKETS
        </div>
      </div>
    </Link>
  );
}
