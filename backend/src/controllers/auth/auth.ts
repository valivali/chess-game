import { NextFunction, Request, Response } from "express"
import { AuthService } from "@/services/auth/auth"
import { AuthServiceInterface } from "@/services/auth/auth.interface"
import { ResponseFormatter } from "@/utils/response-formatter"
import {
  EmailVerificationRequestDto,
  LoginRequestDto,
  PasswordResetConfirmRequestDto,
  PasswordResetRequestDto,
  RefreshTokenRequestDto,
  RegisterRequestDto
} from "@/validation/schemas"
import { AuthenticatedRequest } from "@/middleware/auth-middleware"

export class AuthController {
  constructor(private readonly authService: AuthServiceInterface) {}

  async register(req: Request<{}, {}, RegisterRequestDto>, res: Response, next: NextFunction): Promise<void> {
    try {
      const authResponse = await this.authService.register(req.body)

      ResponseFormatter.created(
        res,
        {
          user: authResponse.user,
          tokens: authResponse.tokens
        },
        "User registered successfully"
      )
    } catch (error) {
      next(error)
    }
  }

  async login(req: Request<{}, {}, LoginRequestDto>, res: Response, next: NextFunction): Promise<void> {
    try {
      const authResponse = await this.authService.login(req.body)

      ResponseFormatter.successWithMessage(
        res,
        {
          user: authResponse.user,
          tokens: authResponse.tokens
        },
        "Login successful"
      )
    } catch (error) {
      next(error)
    }
  }

  async refreshToken(req: Request<{}, {}, RefreshTokenRequestDto>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body
      const tokens = await this.authService.refreshTokens(refreshToken)

      ResponseFormatter.successWithMessage(res, { tokens }, "Tokens refreshed successfully")
    } catch (error) {
      next(error)
    }
  }

  async logout(req: Request<{}, {}, RefreshTokenRequestDto>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body
      await this.authService.logout(refreshToken)

      ResponseFormatter.successWithMessage(res, {}, "Logout successful")
    } catch (error) {
      next(error)
    }
  }

  async logoutAllDevices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.authService.logoutAllDevices(req.user.userId)

      ResponseFormatter.successWithMessage(res, {}, "Logged out from all devices successfully")
    } catch (error) {
      next(error)
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.authService.getUserById(req.user.userId)

      if (!user) {
        ResponseFormatter.notFound(res, "User not found")
        return
      }

      ResponseFormatter.success(res, { user })
    } catch (error) {
      next(error)
    }
  }

  async requestPasswordReset(req: Request<{}, {}, PasswordResetRequestDto>, res: Response, next: NextFunction): Promise<void> {
    try {
      // For security, always return success even if email doesn't exist
      // This prevents email enumeration attacks
      const { email } = req.body

      // TODO: Implement password reset token generation and email sending
      // For now, just return success
      console.log(`Password reset requested for email: ${email}`)

      ResponseFormatter.successWithMessage(res, {}, "If an account with that email exists, a password reset link has been sent")
    } catch (error) {
      next(error)
    }
  }

  async confirmPasswordReset(req: Request<{}, {}, PasswordResetConfirmRequestDto>, res: Response, next: NextFunction): Promise<void> {
    try {
      // TODO: Implement password reset confirmation
      const { token, newPassword } = req.body

      console.log(`Password reset confirmation attempted with token: ${token}`)

      ResponseFormatter.successWithMessage(res, {}, "Password reset successful")
    } catch (error) {
      next(error)
    }
  }

  async verifyEmail(req: Request<{}, {}, EmailVerificationRequestDto>, res: Response, next: NextFunction): Promise<void> {
    try {
      // TODO: Implement email verification
      const { token } = req.body

      console.log(`Email verification attempted with token: ${token}`)

      ResponseFormatter.successWithMessage(res, {}, "Email verified successfully")
    } catch (error) {
      next(error)
    }
  }

  static build(): AuthController {
    return new AuthController(AuthService.build())
  }
}
