// Query client and configuration
export * from "./queryClient"
export * from "./queryKeys"
export * from "./apiClient"

// API modules - complete exports
export * from "./auth.api"
export * from "./game.api"

// Opening API (keeping existing structure)
export * from "./opening.api"

// Legacy compatibility exports (for remaining opening queries/mutations)
export * from "./queries"
export * from "./mutations"

// Integration hooks
export * from "./hooks"
