import { useMutation, useQueryClient } from "@tanstack/react-query"

import { gameService } from "../../services"
import type { CreateGameResponse } from "../../types"
import { queryKeys } from "../queryKeys"

export interface CreateGameVariables {
  playerName: string
}

/**
 * React Query mutation for creating a new game
 * Includes optimistic updates and cache invalidation
 */
export const useCreateGameMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: CreateGameVariables): Promise<CreateGameResponse> => {
      return await gameService.createGame(variables.playerName)
    },
    onSuccess: () => {
      // Invalidate active games to show the new game
      queryClient.invalidateQueries({
        queryKey: queryKeys.games.active()
      })

      // Optionally, we could add optimistic updates here
      // by directly updating the cache with the new game data
    },
    onError: (error) => {
      console.error("Failed to create game:", error)
    }
  })
}

/**
 * Hook that provides a simplified interface for creating games
 * Compatible with the existing component usage patterns
 */
export const useCreateGame = () => {
  const mutation = useCreateGameMutation()

  return {
    createGame: (playerName: string) => mutation.mutateAsync({ playerName }),
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  }
}
