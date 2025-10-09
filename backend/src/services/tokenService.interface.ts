import { AuthTokens, JwtPayload } from "@/types/authTypes"

export interface TokenServiceInterface {
  generateTokens(payload: Omit<JwtPayload, "iat" | "exp">): Promise<AuthTokens>
  verifyAccessToken(token: string): JwtPayload | null
  verifyRefreshToken(token: string): Promise<{ userId: string } | null>
  revokeRefreshToken(token: string): Promise<boolean>
  revokeAllUserTokens(userId: string): Promise<void>
}
