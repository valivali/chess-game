export interface User {
  id: string
  email: string
  username: string
  passwordHash: string
  isEmailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface RefreshToken {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

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

export interface AuthResponse {
  user: Omit<User, "passwordHash">
  tokens: AuthTokens
}

export interface JwtPayload {
  userId: string
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
