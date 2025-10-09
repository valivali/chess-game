import { LoginRequest, RegisterRequest, AuthResponse, AuthTokens, User } from "@/types/authTypes"

export interface AuthServiceInterface {
  register(userData: RegisterRequest): Promise<AuthResponse>
  login(credentials: LoginRequest): Promise<AuthResponse>
  refreshTokens(refreshToken: string): Promise<AuthTokens>
  logout(refreshToken: string): Promise<boolean>
  logoutAllDevices(userId: string): Promise<void>
  getUserById(userId: string): Promise<Omit<User, "passwordHash"> | null>
}
