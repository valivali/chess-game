import { z } from "zod"
import { PIECE_COLOR, GAME_STATUS, PIECE_TYPE } from "@/types/gameTypes"

// Base schemas
export const PositionSchema = z.object({
  x: z.number().int().min(0).max(7),
  y: z.number().int().min(0).max(7)
})

export const PieceColorSchema = z.enum([PIECE_COLOR.WHITE, PIECE_COLOR.BLACK])
export const GameStatusSchema = z.enum([GAME_STATUS.ACTIVE, GAME_STATUS.CHECKMATE, GAME_STATUS.STALEMATE, GAME_STATUS.DRAW])
export const PieceTypeSchema = z.enum([
  PIECE_TYPE.PAWN,
  PIECE_TYPE.ROOK,
  PIECE_TYPE.KNIGHT,
  PIECE_TYPE.BISHOP,
  PIECE_TYPE.QUEEN,
  PIECE_TYPE.KING
])

// Request validation schemas
export const CreateGameRequestSchema = z.object({
  playerName: z.string().min(1).max(50).optional()
})

export const MakeMoveRequestSchema = z.object({
  from: PositionSchema,
  to: PositionSchema,
  playerId: z.string().uuid()
})

export const GameIdParamSchema = z.object({
  gameId: z.string().uuid()
})

// Response schemas for validation
export const GameResponseSchema = z.object({
  id: z.string().uuid(),
  board: z.array(z.array(PieceTypeSchema.nullable())),
  currentPlayer: PieceColorSchema,
  status: GameStatusSchema,
  winner: PieceColorSchema.nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const MoveResponseSchema = z.object({
  from: PositionSchema,
  to: PositionSchema,
  piece: PieceTypeSchema,
  captured: PieceTypeSchema.optional()
})

export const MoveResultResponseSchema = z.object({
  success: z.boolean(),
  game: GameResponseSchema,
  move: MoveResponseSchema.optional(),
  error: z.string().optional()
})

export const GameStatusResponseSchema = z.object({
  id: z.string().uuid(),
  status: GameStatusSchema,
  currentPlayer: PieceColorSchema,
  winner: PieceColorSchema.nullable(),
  isInCheck: z.boolean(),
  availableMoves: z.array(PositionSchema)
})

export const HistoricalMoveResponseSchema = z.object({
  from: PositionSchema,
  to: PositionSchema,
  piece: PieceTypeSchema,
  captured: PieceTypeSchema.optional(),
  timestamp: z.date()
})

export const MoveHistoryResponseSchema = z.object({
  moves: z.array(HistoricalMoveResponseSchema)
})

// Authentication validation schemas
export const RegisterRequestSchema = z
  .object({
    email: z.string().email("Invalid email format").toLowerCase(),
    username: z
      .string()
      .min(2, "Username must be at least 2 characters long")
      .max(50, "Username must be less than 50 characters long")
      .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
      .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
      .regex(/(?=.*\d)/, "Password must contain at least one number")
      .regex(/(?=.*[@$!%*?&])/, "Password must contain at least one special character (@$!%*?&)"),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  })

export const LoginRequestSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase(),
  password: z.string().min(1, "Password is required")
})

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required")
})

export const PasswordResetRequestSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase()
})

export const PasswordResetConfirmRequestSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .regex(/(?=.*\d)/, "Password must contain at least one number")
    .regex(/(?=.*[@$!%*?&])/, "Password must contain at least one special character (@$!%*?&)")
})

export const EmailVerificationRequestSchema = z.object({
  token: z.string().min(1, "Verification token is required")
})

// Export types from schemas
export type CreateGameRequestDto = z.infer<typeof CreateGameRequestSchema>
export type MakeMoveRequestDto = z.infer<typeof MakeMoveRequestSchema>
export type GameIdParamDto = z.infer<typeof GameIdParamSchema>
export type GameResponseDto = z.infer<typeof GameResponseSchema>
export type MoveResultResponseDto = z.infer<typeof MoveResultResponseSchema>
export type GameStatusResponseDto = z.infer<typeof GameStatusResponseSchema>
export type MoveHistoryResponseDto = z.infer<typeof MoveHistoryResponseSchema>

// Authentication DTOs
export type RegisterRequestDto = z.infer<typeof RegisterRequestSchema>
export type LoginRequestDto = z.infer<typeof LoginRequestSchema>
export type RefreshTokenRequestDto = z.infer<typeof RefreshTokenRequestSchema>
export type PasswordResetRequestDto = z.infer<typeof PasswordResetRequestSchema>
export type PasswordResetConfirmRequestDto = z.infer<typeof PasswordResetConfirmRequestSchema>
export type EmailVerificationRequestDto = z.infer<typeof EmailVerificationRequestSchema>
