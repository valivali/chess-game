import jwt, { SignOptions } from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { match } from 'ts-pattern'
import { RefreshTokenModel } from '@/models/RefreshTokenModel'
import { AuthTokens, JwtPayload } from '@/types/authTypes'
import { TokenServiceInterface } from './tokenService.interface'

export class TokenService implements TokenServiceInterface {
  private readonly jwtSecret: string
  private readonly jwtRefreshSecret: string
  private readonly accessTokenExpiry: string
  private readonly refreshTokenExpiry: string

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-key-here'
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
    this.accessTokenExpiry = process.env.JWT_EXPIRES_IN || '1800' // 30 minutes in seconds
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

    if (
      this.jwtSecret === 'your-super-secret-key-here' ||
      this.jwtRefreshSecret === 'your-refresh-secret-key'
    ) {
      console.warn(
        '⚠️  Using default JWT secrets. Please set JWT_SECRET and JWT_REFRESH_SECRET environment variables.'
      )
    }
  }

  async generateTokens(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<AuthTokens> {
    // Generate access token
    const options: SignOptions = {
      expiresIn: parseInt(this.accessTokenExpiry) || 1800 // Default to 30 minutes
    }
    const accessToken = jwt.sign(payload as object, this.jwtSecret, options)

    // Generate refresh token
    const refreshTokenValue = uuidv4()
    const refreshTokenExpiry = this.getRefreshTokenExpiry()

    // Store refresh token in database
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
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload
      return decoded
    } catch (error) {
      return null
    }
  }

  async verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
    try {
      const refreshToken = await RefreshTokenModel.findOne({ token }).exec()

      if (!refreshToken || refreshToken.expiresAt < new Date()) {
        // Clean up expired token
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
      console.error('Error revoking user tokens:', error)
    }
  }

  private getRefreshTokenExpiry(): Date {
    const now = new Date()
    const expiry = new Date(now)

    // Parse refresh token expiry (e.g., "7d", "24h", "60m")
    const regexMatch = this.refreshTokenExpiry.match(/^(\d+)([dhm])$/)
    if (regexMatch && regexMatch[1] && regexMatch[2]) {
      const value = parseInt(regexMatch[1])
      const unit = regexMatch[2]

      match(unit)
        .with('d', () => expiry.setDate(expiry.getDate() + value))
        .with('h', () => expiry.setHours(expiry.getHours() + value))
        .with('m', () => expiry.setMinutes(expiry.getMinutes() + value))
        .otherwise(() => {
          // Fallback for unexpected unit (should not happen due to regex)
          expiry.setDate(expiry.getDate() + 7)
        })
    } else {
      // Default to 7 days
      expiry.setDate(expiry.getDate() + 7)
    }

    return expiry
  }

  static build(): TokenService {
    return new TokenService()
  }
}
