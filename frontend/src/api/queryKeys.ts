/**
 * Centralized query keys for React Query
 * Following the recommended pattern from TanStack Query docs
 */

export const queryKeys = {
  // Auth related queries
  auth: {
    all: ["auth"] as const,
    profile: () => [...queryKeys.auth.all, "profile"] as const
  },

  // Game related queries
  games: {
    all: ["games"] as const,
    active: (page?: number, limit?: number) => [...queryKeys.games.all, "active", { page, limit }] as const,
    history: () => [...queryKeys.games.all, "history"] as const,
    historyInfinite: (limit?: number) => [...queryKeys.games.history(), "infinite", { limit }] as const,
    detail: (gameId: string) => [...queryKeys.games.all, "detail", gameId] as const
  }
} as const

export type QueryKeys = typeof queryKeys
