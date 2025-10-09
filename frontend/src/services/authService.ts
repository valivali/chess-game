import type { AuthResponse, AuthTokens, LoginRequest, RegisterRequest } from "../pages/auth/auth.types"
import type { ApiResponse } from "../types/api.types"
import type { User } from "../types/user.types"

class AuthService {
  private readonly baseUrl: string
  private readonly tokenKey = "chess_access_token"
  private readonly refreshTokenKey = "chess_refresh_token"

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001"
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    })

    const result: ApiResponse<AuthResponse> = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Registration failed")
    }

    if (result.data) {
      this.setTokens(result.data.tokens)
      return result.data
    }

    throw new Error("Invalid response format")
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(credentials)
    })

    const result: ApiResponse<AuthResponse> = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Login failed")
    }

    if (result.data) {
      this.setTokens(result.data.tokens)
      return result.data
    }

    throw new Error("Invalid response format")
  }

  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken()

    if (refreshToken) {
      try {
        await fetch(`${this.baseUrl}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ refreshToken })
        })
      } catch (error) {
        console.warn("Logout request failed:", error)
      }
    }

    this.clearTokens()
  }

  async refreshTokens(): Promise<AuthTokens> {
    const refreshToken = this.getRefreshToken()

    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ refreshToken })
    })

    const result: ApiResponse<{ tokens: AuthTokens }> = await response.json()

    if (!response.ok) {
      this.clearTokens()
      throw new Error(result.message || "Token refresh failed")
    }

    if (result.data) {
      this.setTokens(result.data.tokens)
      return result.data.tokens
    }

    throw new Error("Invalid response format")
  }

  async getProfile(): Promise<User> {
    const response = await this.authenticatedFetch(`${this.baseUrl}/api/auth/profile`)
    const result: ApiResponse<{ user: User }> = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Failed to get profile")
    }

    if (result.data) {
      return result.data.user
    }

    throw new Error("Invalid response format")
  }

  private async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getAccessToken()

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
        await this.refreshTokens()
        const newToken = this.getAccessToken()

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
        this.clearTokens()
        throw new Error("Authentication failed")
      }
    }

    return response
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey)
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey)
  }

  private setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.tokenKey, tokens.accessToken)
    localStorage.setItem(this.refreshTokenKey, tokens.refreshToken)
  }

  private clearTokens(): void {
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.refreshTokenKey)
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }
}

export const authService = new AuthService()
