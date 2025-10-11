import { PublicUser } from '@/types'

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
  user: PublicUser // Always return public user data
  tokens: AuthTokens
}

export interface JwtPayload {
  userId: string // Always UUID
  email: string
  username: string
  iat?: number
  exp?: number
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirmRequest {
  token: string
  newPassword: string
}

export interface EmailVerificationRequest {
  token: string
}
