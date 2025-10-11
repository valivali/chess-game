import { Request, Response, NextFunction } from "express"
import { TokenService } from "@/services/token/token"
import { TokenServiceInterface } from "@/services/token/token.interface"
import { JwtPayload } from "@/types/auth-types"

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload
}

export class AuthMiddleware {
  constructor(private readonly tokenService: TokenServiceInterface) {}

  // Middleware that requires authentication
  authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message: "Access token required"
        })
        return
      }

      const token = authHeader.substring(7) // Remove "Bearer " prefix
      const decoded = this.tokenService.verifyAccessToken(token)

      if (!decoded) {
        res.status(401).json({
          success: false,
          message: "Invalid or expired access token"
        })
        return
      }

      req.user = decoded
      next()
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Authentication failed"
      })
    }
  }

  // Middleware that optionally adds user if authenticated
  optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7)
        const decoded = this.tokenService.verifyAccessToken(token)

        if (decoded) {
          req.user = decoded
        }
      }

      next()
    } catch (error) {
      // Continue without authentication for optional auth
      next()
    }
  }

  static build(): AuthMiddleware {
    return new AuthMiddleware(TokenService.build())
  }
}

// Export singleton instance
export const authMiddleware = AuthMiddleware.build()
