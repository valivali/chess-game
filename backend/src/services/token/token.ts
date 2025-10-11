import jwt, { SignOptions } from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"
import { match } from "ts-pattern"
import { RefreshTokenModel } from "@/models/refresh-token"
import { AuthTokens, JwtPayload } from "@/types/auth-types"
import { JwtConfig, JwtConfigInterface } from "@/config"
import { TokenServiceInterface } from "./token.interface"

export class TokenService implements TokenServiceInterface {
  constructor(private readonly jwtConfig: JwtConfigInterface) {}

  async generateTokens(payload: Omit<JwtPayload, "iat" | "exp">): Promise<AuthTokens> {
    const options: SignOptions = {
      expiresIn: parseInt(this.jwtConfig.accessTokenExpiry) || 1800 // Default to 30 minutes
    }
    const accessToken = jwt.sign(payload as object, this.jwtConfig.jwtSecret, options)

    const refreshTokenValue = uuidv4()
    const refreshTokenExpiry = this.getRefreshTokenExpiry()

    await RefreshTokenModel.create({
      userId: payload.userId,
      token: refreshTokenValue,
      expiresAt: refreshTokenExpiry
    })

    // Get expiry time in seconds for response
    const decoded = jwt.decode(accessToken) as JwtPayload
    const expiresIn = decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 1800 // 30 minutes default

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      expiresIn
    }
  }

  verifyAccessToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtConfig.jwtSecret) as JwtPayload
      return decoded
    } catch (error) {
      return null
    }
  }

  async verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
    try {
      const refreshToken = await RefreshTokenModel.findOne({ token }).exec()

      if (!refreshToken || refreshToken.expiresAt < new Date()) {
        if (refreshToken) {
          await RefreshTokenModel.deleteOne({ _id: refreshToken._id }).exec()
        }
        return null
      }

      return { userId: refreshToken.userId.toString() }
    } catch (error) {
      return null
    }
  }

  async revokeRefreshToken(token: string): Promise<boolean> {
    try {
      const result = await RefreshTokenModel.deleteOne({ token }).exec()
      return result.deletedCount > 0
    } catch (error) {
      return false
    }
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      await RefreshTokenModel.deleteMany({ userId }).exec()
    } catch (error) {
      console.error("Error revoking user tokens:", error)
    }
  }

  private getRefreshTokenExpiry(): Date {
    const now = new Date()
    const expiry = new Date(now)

    // Parse refresh token expiry (e.g., "7d", "24h", "60m")
    const regexMatch = this.jwtConfig.refreshTokenExpiry.match(/^(\d+)([dhm])$/)
    if (regexMatch && regexMatch[1] && regexMatch[2]) {
      const value = parseInt(regexMatch[1])
      const unit = regexMatch[2]

      match(unit)
        .with("d", () => expiry.setDate(expiry.getDate() + value))
        .with("h", () => expiry.setHours(expiry.getHours() + value))
        .with("m", () => expiry.setMinutes(expiry.getMinutes() + value))
        .otherwise(() => {
          expiry.setDate(expiry.getDate() + 7)
        })
    } else {
      expiry.setDate(expiry.getDate() + 7)
    }

    return expiry
  }

  static build(): TokenService {
    return new TokenService(JwtConfig.build())
  }
}
