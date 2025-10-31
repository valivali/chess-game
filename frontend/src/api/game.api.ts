import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { GameMappers } from "../mappers"
import type { PaginatedActiveGamesData, PaginatedGameHistoryData } from "../mappers/gameMapper.interface"
import type { ActiveGamesResponse, CreateGameResponse, GameHistoryResponse } from "../types"
import { apiClient } from "./apiClient"
import { tokenManager } from "./auth.api"
import { queryKeys } from "./queryKeys"

/**
 * Game API functions
 */
const gameApi = {
  async createGame(playerName: string): Promise<CreateGameResponse> {
    const response = await apiClient.post<CreateGameResponse>("/api/game/create", { playerName })
    return response.data
  },

  async getActiveGames(page: number = 1, limit: number = 10): Promise<PaginatedActiveGamesData> {
    if (!tokenManager.isAuthenticated()) {
      throw new Error("Authentication required")
    }

    const response = await apiClient.get<ActiveGamesResponse>(`/api/game/active?page=${page}&limit=${limit}`)
    const mappers = GameMappers.build()
    return mappers.mapApiGamesToActiveGamesData(response.data.data)
  },

  async getGameHistory(page: number = 1, limit: number = 10): Promise<PaginatedGameHistoryData> {
    if (!tokenManager.isAuthenticated()) {
      throw new Error("Authentication required")
    }

    const response = await apiClient.get<GameHistoryResponse>(`/api/game/history?page=${page}&limit=${limit}`)
    const mappers = GameMappers.build()
    return mappers.mapApiHistoryToGameHistoryData(response.data.data)
  }
}

/**
 * React Query hooks for game operations
 */

/**
 * React Query mutation for creating a new game
 */
export const useCreateGameMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (playerName: string) => gameApi.createGame(playerName),
    onSuccess: () => {
      // Invalidate active games to show the new game
      queryClient.invalidateQueries({ queryKey: queryKeys.games.active() })
    },
    onError: (error) => {
      console.error("Create game failed:", error)
    }
  })
}

/**
 * React Query hook for fetching active games
 */
export const useActiveGamesQuery = (page: number = 1, limit: number = 10, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.games.active(page, limit),
    queryFn: () => gameApi.getActiveGames(page, limit),
    enabled: enabled && tokenManager.isAuthenticated(),
    // Active games change frequently, cache for 30 seconds
    staleTime: 30 * 1000,
    // Refetch on window focus to get latest game states
    refetchOnWindowFocus: true,
    // Retry on failure
    retry: 2
  })
}

/**
 * React Query hook for fetching game history
 */
export const useGameHistoryQuery = (page: number = 1, limit: number = 10, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.games.history(),
    queryFn: () => gameApi.getGameHistory(page, limit),
    enabled: enabled && tokenManager.isAuthenticated(),
    // Game history is stable, cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Don't refetch history on window focus
    refetchOnWindowFocus: false,
    // Retry on failure
    retry: 2
  })
}

/**
 * Simplified hooks for easier integration with existing components
 */
export const useGameMutations = () => {
  const createGameMutation = useCreateGameMutation()

  return {
    // Create game
    createGame: createGameMutation.mutateAsync,
    isCreateGameLoading: createGameMutation.isPending,
    createGameError: createGameMutation.error,
    resetCreateGameError: createGameMutation.reset
  }
}

/**
 * Legacy compatibility hook for creating games
 * Provides the same interface as the old useCreateGame hook
 */
export const useCreateGame = () => {
  const { createGame, isCreateGameLoading, createGameError, resetCreateGameError } = useGameMutations()

  return {
    createGame,
    isLoading: isCreateGameLoading,
    error: createGameError,
    reset: resetCreateGameError
  }
}

/**
 * Combined hook for game queries
 */
export const useGameQueries = (
  activeGamesPage: number = 1,
  activeGamesLimit: number = 10,
  historyPage: number = 1,
  historyLimit: number = 10,
  enabled: boolean = true
) => {
  const activeGamesQuery = useActiveGamesQuery(activeGamesPage, activeGamesLimit, enabled)
  const gameHistoryQuery = useGameHistoryQuery(historyPage, historyLimit, enabled)

  return {
    // Active games
    activeGames: activeGamesQuery.data,
    isActiveGamesLoading: activeGamesQuery.isLoading,
    activeGamesError: activeGamesQuery.error,
    refetchActiveGames: activeGamesQuery.refetch,

    // Game history
    gameHistory: gameHistoryQuery.data,
    isGameHistoryLoading: gameHistoryQuery.isLoading,
    gameHistoryError: gameHistoryQuery.error,
    refetchGameHistory: gameHistoryQuery.refetch,

    // Combined states
    isLoading: activeGamesQuery.isLoading || gameHistoryQuery.isLoading,
    hasError: !!activeGamesQuery.error || !!gameHistoryQuery.error
  }
}

/**
 * Legacy compatibility hook for active games
 * Provides the same interface as the old useActiveGames hook for easier migration
 */
export const useActiveGames = (isAuthenticated: boolean, page: number = 1) => {
  const query = useActiveGamesQuery(page, 10, isAuthenticated)

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

/**
 * Legacy compatibility hook for game history
 * Provides the same interface as the old useGameHistory hook for easier migration
 */
export const useGameHistory = (isAuthenticated: boolean, page: number = 1) => {
  const query = useGameHistoryQuery(page, 10, isAuthenticated)

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
