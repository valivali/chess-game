import { useInfiniteQuery, useQuery } from "@tanstack/react-query"

import type { HistoryGameData } from "../../components/GameHistoryTable"
import { gameService } from "../../services"
import type { PaginationInfo } from "../../types"
import { queryKeys } from "../queryKeys"

export interface GameHistoryQueryResult {
  items: HistoryGameData[]
  pagination: PaginationInfo
}

export interface UseGameHistoryQueryOptions {
  page?: number
  limit?: number
  enabled?: boolean
}

/**
 * React Query hook for fetching game history with pagination
 * Standard paginated version for backward compatibility
 */
export const useGameHistoryQuery = (options: UseGameHistoryQueryOptions = {}) => {
  const { page = 1, limit = 10, enabled = true } = options

  return useQuery({
    queryKey: queryKeys.games.history(),
    queryFn: async (): Promise<GameHistoryQueryResult> => {
      const response = await gameService.getGameHistory(page, limit)

      if (!response) {
        return {
          items: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0
          }
        }
      }

      return response
    },
    enabled,
    // Game history doesn't change as frequently, cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Show cached data while refetching
    placeholderData: (previousData) => previousData
  })
}

/**
 * Infinite query version for better UX with infinite scrolling
 * This is the recommended approach for game history
 */
export const useGameHistoryInfiniteQuery = (options: { limit?: number; enabled?: boolean } = {}) => {
  const { limit = 10, enabled = true } = options

  return useInfiniteQuery({
    queryKey: queryKeys.games.historyInfinite(limit),
    queryFn: async ({ pageParam = 1 }): Promise<GameHistoryQueryResult> => {
      const response = await gameService.getGameHistory(pageParam, limit)

      if (!response) {
        return {
          items: [],
          pagination: {
            page: pageParam,
            limit,
            total: 0,
            totalPages: 0
          }
        }
      }

      return response
    },
    enabled,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
    // Game history is relatively stable, cache for 5 minutes
    staleTime: 5 * 60 * 1000
  })
}

/**
 * Hook to get game history data with loading and error states
 * Provides the same interface as the old useGameHistory hook for easier migration
 */
export const useGameHistory = (isAuthenticated: boolean, page: number = 1) => {
  const query = useGameHistoryQuery({
    page,
    enabled: isAuthenticated
  })

  return {
    gameHistory: query.data?.items ?? [],
    pagination: query.data?.pagination ?? {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    // For compatibility with old interface
    loadHistory: (newPage?: number) => {
      if (newPage && newPage !== page) {
        // This will be handled by the parent component updating the page prop
        return Promise.resolve()
      }
      return query.refetch().then(() => {})
    },
    initializeData: () => Promise.resolve(),
    clearData: () => {
      // Data clearing is handled by React Query when enabled becomes false
    }
  }
}
