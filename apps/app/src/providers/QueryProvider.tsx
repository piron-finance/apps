"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds — serve from cache, refetch in background
            gcTime: 5 * 60 * 1000, // 5 minutes — keep unused queries in memory
            refetchOnWindowFocus: true, // re-validate when user returns to tab
            refetchOnReconnect: true, // re-validate on network reconnect
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
