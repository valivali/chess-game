import { useQuery } from "@tanstack/react-query"

import { authService } from "../../services/authService"
import type { User } from "../../types/user.types"
import { queryKeys } from "../queryKeys"

/**
 * React Query hook for fetching user profile
 * Only runs when user is authenticated
 */
export const useProfileQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: async (): Promise<User> => {
      return await authService.getProfile()
    },
    enabled: enabled && authService.isAuthenticated(),
    // Profile data is relatively stable, cache for 10 minutes
    staleTime: 10 * 60 * 1000,
    // Don't refetch profile on window focus by default
    refetchOnWindowFocus: false,
    // Retry on failure since profile is critical
    retry: 2
  })
}

/**
 * Hook to check if user is authenticated
 * This is a lightweight check that doesn't make API calls
 */
export const useAuthStatus = () => {
  const isAuthenticated = authService.isAuthenticated()
  const accessToken = authService.getAccessToken()
  const refreshToken = authService.getRefreshToken()

  return {
    isAuthenticated,
    hasTokens: !!(accessToken && refreshToken),
    accessToken,
    refreshToken
  }
}
