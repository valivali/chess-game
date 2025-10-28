import { useQueryClient } from "@tanstack/react-query"

import { useAuth } from "../../contexts"
import { queryKeys } from "../queryKeys"

/**
 * Hook that integrates React Query with the existing AuthContext
 * This provides a bridge between the old context-based auth and new React Query approach
 */
export const useAuthIntegration = () => {
  const auth = useAuth()
  const queryClient = useQueryClient()

  // Enhanced logout that clears React Query cache
  const enhancedLogout = () => {
    auth.logout()
    queryClient.clear()
  }

  // Function to invalidate auth-related queries when auth state changes
  const invalidateAuthQueries = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.games.all })
  }

  return {
    ...auth,
    logout: enhancedLogout,
    invalidateAuthQueries
  }
}

/**
 * Hook to sync auth state with React Query cache
 * Call this when auth state changes to keep React Query in sync
 */
export const useAuthSync = () => {
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuth()

  const syncAuthState = () => {
    if (isAuthenticated && user) {
      // Set user profile in cache
      queryClient.setQueryData(queryKeys.auth.profile(), user)
    } else {
      // Clear auth-related cache when not authenticated
      queryClient.removeQueries({ queryKey: queryKeys.auth.all })
      queryClient.removeQueries({ queryKey: queryKeys.games.all })
    }
  }

  return { syncAuthState }
}
