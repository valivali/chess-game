import { UserService } from "../user/user"
import { UserServiceInterface } from "../user/user.interface"
import { TokenService } from "../token/token"
import { TokenServiceInterface } from "../token/token.interface"
import { AuthServiceInterface } from "./auth.interface"
import { PublicUser, User } from "@/types/domain"
import { AuthResponse, AuthTokens, LoginRequest, RegisterRequest } from "@/types/api"

export class AuthService implements AuthServiceInterface {
  constructor(
    private readonly userService: UserServiceInterface,
    private readonly tokenService: TokenServiceInterface
  ) {}

  static build(): AuthService {
    return new AuthService(UserService.build(), TokenService.build())
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    if (userData.password !== userData.confirmPassword) {
      throw new Error("Passwords do not match")
    }

    this.validatePassword(userData.password)

    const user = await this.userService.createUser(userData)

    console.log("User created:", user)
    const tokens = await this.tokenService.generateTokens({
      userId: user.id,
      email: user.email,
      username: user.username
    })

    return {
      user: this.sanitizeUser(user),
      tokens
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { email, password } = credentials

    const user = await this.userService.findUserByEmail(email)
    if (!user) {
      throw new Error("Invalid email or password")
    }

    const isPasswordValid = await this.userService.verifyPassword(password, user.passwordHash)
    if (!isPasswordValid) {
      throw new Error("Invalid email or password")
    }

    const tokens = await this.tokenService.generateTokens({
      userId: user.id,
      email: user.email,
      username: user.username
    })

    return {
      user: this.sanitizeUser(user),
      tokens
    }
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const tokenData = await this.tokenService.verifyRefreshToken(refreshToken)
    if (!tokenData) {
      throw new Error("Invalid or expired refresh token")
    }

    const user = await this.userService.findUserById(tokenData.userId)
    if (!user) {
      throw new Error("User not found")
    }

    await this.tokenService.revokeRefreshToken(refreshToken)

    const tokens = await this.tokenService.generateTokens({
      userId: user.id,
      email: user.email,
      username: user.username
    })

    return tokens
  }

  async logout(refreshToken: string): Promise<boolean> {
    return await this.tokenService.revokeRefreshToken(refreshToken)
  }

  async logoutAllDevices(userId: string): Promise<void> {
    await this.tokenService.revokeAllUserTokens(userId)
  }

  async getUserById(userId: string): Promise<PublicUser | null> {
    const user = await this.userService.findUserById(userId)
    if (!user) return null

    const { passwordHash, ...publicUser } = user
    return publicUser
  }

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long")
    }

    if (!/(?=.*[a-z])/.test(password)) {
      throw new Error("Password must contain at least one lowercase letter")
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      throw new Error("Password must contain at least one uppercase letter")
    }

    if (!/(?=.*\d)/.test(password)) {
      throw new Error("Password must contain at least one number")
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      throw new Error("Password must contain at least one special character (@$!%*?&)")
    }
  }

  private sanitizeUser(user: User): PublicUser {
    const { passwordHash, ...sanitizedUser } = user
    return sanitizedUser
  }
}
