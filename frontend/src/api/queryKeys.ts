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
  },

  // Opening trainer related queries
  openings: {
    all: ["openings"] as const,
    // Popular openings from Lichess Masters
    popular: (options?: { minGames?: number; minRating?: number; limit?: number }) =>
      [...queryKeys.openings.all, "popular", options] as const,
    search: (query: string, options?: { limit?: number }) => [...queryKeys.openings.all, "search", query, options] as const,
    byDifficulty: (difficulty: "beginner" | "intermediate" | "advanced") => [...queryKeys.openings.all, "difficulty", difficulty] as const,
    // Repertoire related queries
    repertoires: () => [...queryKeys.openings.all, "repertoires"] as const,
    repertoire: (repertoireId: string) => [...queryKeys.openings.all, "repertoire", repertoireId] as const,
    publicRepertoires: (tags?: string[], limit?: number, offset?: number) =>
      [...queryKeys.openings.all, "public", { tags, limit, offset }] as const,
    // Training session queries
    sessions: () => [...queryKeys.openings.all, "sessions"] as const,
    session: (sessionId: string) => [...queryKeys.openings.all, "session", sessionId] as const,
    // Progress tracking queries
    progress: (repertoireId: string) => [...queryKeys.openings.all, "progress", repertoireId] as const,
    progressNode: (repertoireId: string, nodeId: string) => [...queryKeys.openings.progress(repertoireId), "node", nodeId] as const,
    reviewPositions: (repertoireId?: string) => [...queryKeys.openings.all, "review", { repertoireId }] as const,
    stats: () => [...queryKeys.openings.all, "stats"] as const
  }
} as const

export type QueryKeys = typeof queryKeys
