import { useQuery } from "@tanstack/react-query"

import type { GameData } from "../../components/ActiveGamesTable"
import { gameService } from "../../services"
import type { PaginationInfo } from "../../types"
import { queryKeys } from "../queryKeys"

export interface ActiveGamesQueryResult {
  items: GameData[]
  pagination: PaginationInfo
}

export interface UseActiveGamesQueryOptions {
  page?: number
  limit?: number
  enabled?: boolean
}

/**
 * React Query hook for fetching active games with pagination
 * Replaces the old useActiveGames hook with better caching and background updates
 */
export const useActiveGamesQuery = (options: UseActiveGamesQueryOptions = {}) => {
  const { page = 1, limit = 10, enabled = true } = options

  return useQuery({
    queryKey: queryKeys.games.active(page, limit),
    queryFn: async (): Promise<ActiveGamesQueryResult> => {
      const response = await gameService.getActiveGames(page, limit)

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
    // Refetch active games every 30 seconds for real-time updates
    refetchInterval: 30000,
    // Keep data fresh for 30 seconds
    staleTime: 30000,
    // Show cached data while refetching in background
    placeholderData: (previousData) => previousData
  })
}

/**
 * Hook to get active games data with loading and error states
 * Provides the same interface as the old useActiveGames hook for easier migration
 */
export const useActiveGames = (isAuthenticated: boolean, page: number = 1) => {
  const query = useActiveGamesQuery({
    page,
    enabled: isAuthenticated
  })

  return {
    activeGames: query.data?.items ?? [],
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
    loadGames: (newPage?: number) => {
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
