import { QueryClient } from "@tanstack/react-query"

import { authService } from "../services/authService"

/**
 * QueryClient configuration for the Chess Game application
 * Handles authentication errors and provides sensible defaults
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests up to 3 times
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (error?.status === 401 || error?.message?.includes("Authentication")) {
          return false
        }
        // Don't retry on client errors (4xx)
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 3
      },
      // Refetch on window focus for better UX
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect by default (can be overridden per query)
      refetchOnReconnect: "always"
    },
    mutations: {
      // Handle authentication errors globally
      onError: (error: any) => {
        if (error?.status === 401 || error?.message?.includes("Authentication")) {
          // Clear all cached data on auth errors
          queryClient.clear()
          // Let AuthContext handle the logout
          authService.logout()
        }
      },
      // Retry mutations once on network errors
      retry: (failureCount, error: any) => {
        if (error?.status === 401) return false
        return failureCount < 1
      }
    }
  }
})

/**
 * Helper function to invalidate all game-related queries
 * Useful after game state changes
 */
export const invalidateGameQueries = () => {
  queryClient.invalidateQueries({ queryKey: ["games"] })
}

/**
 * Helper function to clear all cached data
 * Useful on logout
 */
export const clearAllQueries = () => {
  queryClient.clear()
}
