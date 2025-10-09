import { UserService } from "./UserService"
import { UserServiceInterface } from "./userService.interface"
import { TokenService } from "./TokenService"
import { TokenServiceInterface } from "./tokenService.interface"
import { AuthServiceInterface } from "./authService.interface"
import { LoginRequest, RegisterRequest, AuthResponse, AuthTokens, User } from "@/types/authTypes"

export class AuthService implements AuthServiceInterface {
  constructor(
    private readonly userService: UserServiceInterface,
    private readonly tokenService: TokenServiceInterface
  ) {}

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    // Validate password confirmation
    if (userData.password !== userData.confirmPassword) {
      throw new Error("Passwords do not match")
    }

    // Validate password strength
    this.validatePassword(userData.password)

    // Create user
    const user = await this.userService.createUser(userData)

    // Generate tokens
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

    // Find user by email
    const user = await this.userService.findUserByEmail(email)
    if (!user) {
      throw new Error("Invalid email or password")
    }

    // Verify password
    const isPasswordValid = await this.userService.verifyPassword(password, user.passwordHash)
    if (!isPasswordValid) {
      throw new Error("Invalid email or password")
    }

    // Generate tokens
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
    // Verify refresh token
    const tokenData = await this.tokenService.verifyRefreshToken(refreshToken)
    if (!tokenData) {
      throw new Error("Invalid or expired refresh token")
    }

    // Get user data
    const user = await this.userService.findUserById(tokenData.userId)
    if (!user) {
      throw new Error("User not found")
    }

    // Revoke old refresh token
    await this.tokenService.revokeRefreshToken(refreshToken)

    // Generate new tokens
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

  async getUserById(userId: string): Promise<Omit<User, "passwordHash"> | null> {
    const user = await this.userService.findUserById(userId)
    return user ? this.sanitizeUser(user) : null
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

  private sanitizeUser(user: User): Omit<User, "passwordHash"> {
    const { passwordHash, ...sanitizedUser } = user
    return sanitizedUser
  }

  static build(): AuthService {
    return new AuthService(UserService.build(), TokenService.build())
  }
}
