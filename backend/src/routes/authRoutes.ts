import { Router } from "express"
import { AuthController } from "@/controllers/AuthController"
import { validateRequest } from "@/middleware/validation"
import { authMiddleware } from "@/middleware/authMiddleware"
import { authLimiter, registerLimiter, passwordResetLimiter } from "@/middleware/rateLimiter"
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  RefreshTokenRequestSchema,
  PasswordResetRequestSchema,
  PasswordResetConfirmRequestSchema,
  EmailVerificationRequestSchema
} from "@/validation/schemas"

const router = Router()
const authController = AuthController.build()

// Public routes with rate limiting
router.post("/register", registerLimiter, validateRequest(RegisterRequestSchema), authController.register.bind(authController))

router.post("/login", authLimiter, validateRequest(LoginRequestSchema), authController.login.bind(authController))

router.post("/refresh", authLimiter, validateRequest(RefreshTokenRequestSchema), authController.refreshToken.bind(authController))

router.post("/logout", validateRequest(RefreshTokenRequestSchema), authController.logout.bind(authController))

router.post(
  "/request-password-reset",
  passwordResetLimiter,
  validateRequest(PasswordResetRequestSchema),
  authController.requestPasswordReset.bind(authController)
)

router.post(
  "/confirm-password-reset",
  passwordResetLimiter,
  validateRequest(PasswordResetConfirmRequestSchema),
  authController.confirmPasswordReset.bind(authController)
)

router.post("/verify-email", validateRequest(EmailVerificationRequestSchema), authController.verifyEmail.bind(authController))

// Protected routes (require authentication)
router.get("/profile", authMiddleware.authenticate, (req, res, next) => authController.getProfile(req as any, res, next))

router.post("/logout-all", authMiddleware.authenticate, (req, res, next) => authController.logoutAllDevices(req as any, res, next))

export default router
