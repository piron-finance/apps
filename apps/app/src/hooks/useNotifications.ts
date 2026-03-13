"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/endpoints";

/**
 * Hook to fetch user notifications
 */
export function useNotifications(
  walletAddress?: string,
  params?: { page?: number; limit?: number; unreadOnly?: boolean }
) {
  return useQuery({
    queryKey: ["notifications", walletAddress, params],
    queryFn: () => notificationsApi.getAll(walletAddress!, params),
    enabled: !!walletAddress,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
    retry: 2,
  });
}

/**
 * Hook to mark notification as read
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ walletAddress, notificationId }: { walletAddress: string; notificationId: string }) =>
      notificationsApi.markAsRead(walletAddress, notificationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notifications", variables.walletAddress] });
    },
  });
}
