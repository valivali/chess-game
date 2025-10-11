import { PublicUser } from "@/types/domain"
import { LoginRequest, RegisterRequest, AuthResponse, AuthTokens } from "@/types/api"

export interface AuthServiceInterface {
  register(userData: RegisterRequest): Promise<AuthResponse>
  login(credentials: LoginRequest): Promise<AuthResponse>
  refreshTokens(refreshToken: string): Promise<AuthTokens>
  logout(refreshToken: string): Promise<boolean>
  logoutAllDevices(userId: string): Promise<void>
  getUserById(userId: string): Promise<PublicUser | null>
}
