import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { AuthResponse, AuthTokens, LoginRequest, RegisterRequest } from "../pages/auth/auth.types"
import type { ApiResponse } from "../types/api.types"
import type { User } from "../types/user.types"
import { apiClient } from "./apiClient"
import { queryKeys } from "./queryKeys"

/**
 * Token management utilities
 */
class TokenManager {
  private readonly tokenKey = "chess_access_token"
  private readonly refreshTokenKey = "chess_refresh_token"

  getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey)
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey)
  }

  setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.tokenKey, tokens.accessToken)
    localStorage.setItem(this.refreshTokenKey, tokens.refreshToken)
  }

  clearTokens(): void {
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.refreshTokenKey)
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }
}

export const tokenManager = new TokenManager()

/**
 * Auth API functions
 */
export const authApi = {
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>("/api/auth/register", userData)

    if (response.data.data) {
      tokenManager.setTokens(response.data.data.tokens)
      return response.data.data
    }

    throw new Error("Invalid response format")
  },

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>("/api/auth/login", credentials)

    if (response.data.data) {
      tokenManager.setTokens(response.data.data.tokens)
      return response.data.data
    }

    throw new Error("Invalid response format")
  },

  async logout(): Promise<void> {
    const refreshToken = tokenManager.getRefreshToken()

    if (refreshToken) {
      try {
        await apiClient.post("/api/auth/logout", { refreshToken })
      } catch (error) {
        console.warn("Logout request failed:", error)
      }
    }

    tokenManager.clearTokens()
  },

  async refreshTokens(): Promise<AuthTokens> {
    const refreshToken = tokenManager.getRefreshToken()

    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    try {
      const response = await apiClient.post<ApiResponse<{ tokens: AuthTokens }>>("/api/auth/refresh", { refreshToken })

      if (response.data.data) {
        tokenManager.setTokens(response.data.data.tokens)
        return response.data.data.tokens
      }

      throw new Error("Invalid response format")
    } catch (error) {
      tokenManager.clearTokens()
      throw error
    }
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<{ user: User }>>("/api/auth/profile")

    if (response.data.data) {
      return response.data.data.user
    }

    throw new Error("Invalid response format")
  }
}

/**
 * React Query hooks for authentication
 */

/**
 * React Query mutation for user login
 */
export const useLoginMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.login,
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
    mutationFn: authApi.register,
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
    mutationFn: authApi.refreshTokens,
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
    mutationFn: authApi.logout,
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
 * React Query hook for fetching user profile
 * Only runs when user is authenticated
 */
export const useProfileQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: authApi.getProfile,
    enabled: enabled && tokenManager.isAuthenticated(),
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
  const isAuthenticated = tokenManager.isAuthenticated()
  const accessToken = tokenManager.getAccessToken()
  const refreshToken = tokenManager.getRefreshToken()

  return {
    isAuthenticated,
    hasTokens: !!(accessToken && refreshToken),
    accessToken,
    refreshToken
  }
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

/**
 * Authenticated fetch utility for other API modules
 * This replaces the authenticatedFetch method from authService
 */
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = tokenManager.getAccessToken()

  if (!token) {
    throw new Error("No access token available")
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  })

  // If token is expired, try to refresh
  if (response.status === 401) {
    try {
      await authApi.refreshTokens()
      const newToken = tokenManager.getAccessToken()

      if (newToken) {
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
            "Content-Type": "application/json"
          }
        })
      }
    } catch (error) {
      console.error("Failed to refresh token:", error)
      tokenManager.clearTokens()
      throw new Error("Authentication failed")
    }
  }

  return response
}
