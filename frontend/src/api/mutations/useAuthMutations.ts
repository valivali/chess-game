import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { AuthResponse, AuthTokens, LoginRequest, RegisterRequest } from "../../pages/auth/auth.types"
import { authService } from "../../services/authService"
import { queryKeys } from "../queryKeys"

/**
 * React Query mutation for user login
 */
export const useLoginMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: LoginRequest): Promise<AuthResponse> => {
      return await authService.login(credentials)
    },
    onSuccess: (data) => {
      // Set the user profile data in cache
      queryClient.setQueryData(queryKeys.auth.profile(), data.user)

      // Invalidate and refetch any auth-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all })

      // Invalidate game queries to fetch user-specific data
      queryClient.invalidateQueries({ queryKey: queryKeys.games.all })
    },
    onError: (error) => {
      console.error("Login failed:", error)
    }
  })
}

/**
 * React Query mutation for user registration
 */
export const useRegisterMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userData: RegisterRequest): Promise<AuthResponse> => {
      return await authService.register(userData)
    },
    onSuccess: (data) => {
      // Set the user profile data in cache
      queryClient.setQueryData(queryKeys.auth.profile(), data.user)

      // Invalidate and refetch any auth-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all })

      // Invalidate game queries to fetch user-specific data
      queryClient.invalidateQueries({ queryKey: queryKeys.games.all })
    },
    onError: (error) => {
      console.error("Registration failed:", error)
    }
  })
}

/**
 * React Query mutation for token refresh
 */
export const useRefreshTokenMutation = () => {
  return useMutation({
    mutationFn: async (): Promise<AuthTokens> => {
      return await authService.refreshTokens()
    },
    onError: (error) => {
      console.error("Token refresh failed:", error)
      // The queryClient error handler will clear cache and logout
    }
  })
}

/**
 * React Query mutation for user logout
 */
export const useLogoutMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<void> => {
      return await authService.logout()
    },
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear()
    },
    onError: (error) => {
      console.error("Logout failed:", error)
      // Still clear cache even if logout request fails
      queryClient.clear()
    }
  })
}

/**
 * Simplified hooks for easier integration with existing components
 */
export const useAuthMutations = () => {
  const loginMutation = useLoginMutation()
  const registerMutation = useRegisterMutation()
  const refreshMutation = useRefreshTokenMutation()
  const logoutMutation = useLogoutMutation()

  return {
    // Login
    login: loginMutation.mutateAsync,
    isLoginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
    resetLoginError: loginMutation.reset,

    // Register
    register: registerMutation.mutateAsync,
    isRegisterLoading: registerMutation.isPending,
    registerError: registerMutation.error,
    resetRegisterError: registerMutation.reset,

    // Refresh tokens
    refreshTokens: refreshMutation.mutateAsync,
    isRefreshLoading: refreshMutation.isPending,
    refreshError: refreshMutation.error,

    // Logout
    logout: () => {
      logoutMutation.mutate()
    },
    isLogoutLoading: logoutMutation.isPending
  }
}
