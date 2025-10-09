import type { User } from "../../types/user.types"

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  confirmPassword: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => void
  clearError: () => void
  refreshTokens: () => Promise<void>
}

export type AuthMode = "login" | "register" | "guest"

export interface AuthFormData {
  email: string
  username: string
  password: string
  confirmPassword: string
}

// Re-export User type for convenience in auth context
export type { User } from "../../types/user.types"
