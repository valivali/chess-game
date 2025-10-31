import { z } from "zod"
import { GAME_STATUS, PIECE_COLOR, PIECE_TYPE } from "@/types/game-types"
import { OPENING_DIFFICULTY } from "@/types/opening-types"

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
  playerId: z.uuid()
})

export const GameIdParamSchema = z.object({
  gameId: z.uuid()
})

// Pagination schemas
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
})

// Response schemas for validation
export const GameResponseSchema = z.object({
  id: z.uuid(),
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
  id: z.uuid(),
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

// Game list response schemas
export const GameListItemSchema = z.object({
  id: z.uuid(),
  opponentName: z.string(),
  moveCount: z.number().int().min(0),
  currentPlayer: PieceColorSchema,
  status: GameStatusSchema,
  lastMove: z.date(),
  userColor: PieceColorSchema,
  createdAt: z.date(),
  updatedAt: z.date()
})

export const GameHistoryItemSchema = z.object({
  id: z.uuid(),
  opponentName: z.string(),
  result: z.enum(["win", "loss", "draw"]),
  endReason: z.enum(["checkmate", "stalemate", "draw", "resignation", "timeout"]),
  moveCount: z.number().int().min(0),
  duration: z.number().int().min(0), // in minutes
  completedAt: z.date(),
  userColor: PieceColorSchema
})

export const PaginatedResponseSchema = <T>(itemSchema: z.ZodSchema<T>) =>
  z.object({
    items: z.array(itemSchema),
    pagination: z.object({
      page: z.number().int().min(1),
      limit: z.number().int().min(1),
      total: z.number().int().min(0),
      totalPages: z.number().int().min(0)
    })
  })

export const ActiveGamesResponseSchema = PaginatedResponseSchema(GameListItemSchema)
export const GameHistoryResponseSchema = PaginatedResponseSchema(GameHistoryItemSchema)

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

// Popular openings query schemas
export const PopularOpeningsQuerySchema = z.object({
  minGames: z.coerce.number().int().min(0).optional(),
  minRating: z.coerce.number().int().min(0).max(3000).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50)
})

export const SearchOpeningsQuerySchema = z.object({
  q: z.string().min(1, "Search query is required"),
  limit: z.coerce.number().int().min(1).max(100).default(50)
})

export const DifficultyParamSchema = z.object({
  difficulty: z.enum([OPENING_DIFFICULTY.BEGINNER, OPENING_DIFFICULTY.INTERMEDIATE, OPENING_DIFFICULTY.ADVANCED])
})

// Opening-specific parameter schemas
export const RepertoireIdParamSchema = z.object({
  repertoireId: z.string().uuid("Invalid repertoire ID format")
})

export const SessionIdParamSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID format")
})

export const RepertoireAndNodeIdParamSchema = z.object({
  repertoireId: z.string().uuid("Invalid repertoire ID format"),
  nodeId: z.string().min(1, "Node ID is required")
})

export const FenParamSchema = z.object({
  fen: z.string().min(1, "FEN string is required")
})

// Opening-specific query schemas
export const PublicRepertoiresQuerySchema = z.object({
  tags: z
    .string()
    .or(z.array(z.string()))
    .optional()
    .transform((val) => {
      if (!val) return undefined
      return Array.isArray(val) ? val : [val]
    }),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0)
})

export const UserSessionsQuerySchema = z.object({
  status: z.string().optional()
})

export const PositionsDueQuerySchema = z.object({
  repertoireId: z.uuid().optional()
})

// Opening repertoire schemas
export const OpeningMoveSchema = z.object({
  san: z.string().min(1, "SAN notation is required"),
  from: PositionSchema,
  to: PositionSchema,
  uci: z.string().min(1, "UCI notation is required"),
  captured: z.string().optional(),
  promotion: z.string().optional(),
  castling: z.enum(["kingside", "queenside"]).optional(),
  enPassant: z.boolean().optional()
})

export const OpeningNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string().min(1, "Node ID is required"),
    move: OpeningMoveSchema.nullable(),
    fen: z.string().min(1, "FEN string is required"),
    comment: z.string().optional(),
    evaluation: z.number().optional(),
    isMainLine: z.boolean().default(false),
    priority: z.number().int().min(1).max(10).default(5),
    children: z.array(OpeningNodeSchema).default([]),
    stats: z
      .object({
        games: z.number().int().min(0).default(0),
        whiteWins: z.number().int().min(0).default(0),
        draws: z.number().int().min(0).default(0),
        blackWins: z.number().int().min(0).default(0)
      })
      .optional(),
    tags: z.array(z.string()).default([]),
    lastUpdated: z.date().default(() => new Date())
  })
)

export const RepertoireMetadataSchema = z.object({
  totalPositions: z.number().int().min(0).default(0),
  maxDepth: z.number().int().min(0).default(0),
  source: z.enum(["manual", "pgn_import", "lichess"]).default("manual"),
  version: z.number().int().min(1).default(1)
})

export const CreateRepertoireRequestSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters").trim(),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .trim()
      .optional()
      .transform((val) => val || undefined),
    color: z.enum(["white", "black"]),
    rootNode: OpeningNodeSchema,
    isPublic: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    metadata: RepertoireMetadataSchema.optional()
  })
  .transform((obj) => {
    // Remove undefined properties to match domain interface expectations
    const result: any = {
      name: obj.name,
      color: obj.color,
      rootNode: obj.rootNode,
      isPublic: obj.isPublic,
      tags: obj.tags
    }
    if (obj.description !== undefined) result.description = obj.description
    if (obj.metadata !== undefined) result.metadata = obj.metadata
    return result
  })

export const UpdateRepertoireRequestSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters").trim().optional(),
    description: z.string().max(500, "Description must be less than 500 characters").trim().optional(),
    color: z.enum(["white", "black"]).optional(),
    rootNode: OpeningNodeSchema.optional(),
    isPublic: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    metadata: RepertoireMetadataSchema.partial().optional()
  })
  .transform((obj) => {
    // Remove undefined properties to match Partial<T> expectations
    const result: any = {}
    if (obj.name !== undefined) result.name = obj.name
    if (obj.description !== undefined) result.description = obj.description
    if (obj.color !== undefined) result.color = obj.color
    if (obj.rootNode !== undefined) result.rootNode = obj.rootNode
    if (obj.isPublic !== undefined) result.isPublic = obj.isPublic
    if (obj.tags !== undefined) result.tags = obj.tags
    if (obj.metadata !== undefined) result.metadata = obj.metadata
    return result
  })

export const ImportPgnRequestSchema = z
  .object({
    pgn: z.string().min(1, "PGN content is required"),
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters").trim(),
    description: z.string().max(500, "Description must be less than 500 characters").trim().optional(),
    color: z.enum(["white", "black"])
  })
  .transform((obj) => {
    // Remove undefined properties to match interface expectations
    const result: any = {
      pgn: obj.pgn,
      name: obj.name,
      color: obj.color
    }
    if (obj.description !== undefined) result.description = obj.description
    return result
  })

// Export types from schemas
export type CreateGameRequestDto = z.infer<typeof CreateGameRequestSchema>
export type MakeMoveRequestDto = z.infer<typeof MakeMoveRequestSchema>
export type GameIdParamDto = z.infer<typeof GameIdParamSchema>
export type PaginationQueryDto = z.infer<typeof PaginationQuerySchema>
export type GameResponseDto = z.infer<typeof GameResponseSchema>
export type MoveResultResponseDto = z.infer<typeof MoveResultResponseSchema>
export type GameStatusResponseDto = z.infer<typeof GameStatusResponseSchema>
export type MoveHistoryResponseDto = z.infer<typeof MoveHistoryResponseSchema>
export type GameListItemDto = z.infer<typeof GameListItemSchema>
export type GameHistoryItemDto = z.infer<typeof GameHistoryItemSchema>
export type ActiveGamesResponseDto = z.infer<typeof ActiveGamesResponseSchema>
export type GameHistoryResponseDto = z.infer<typeof GameHistoryResponseSchema>

// Popular openings DTOs
export type PopularOpeningsQueryDto = z.infer<typeof PopularOpeningsQuerySchema>
export type SearchOpeningsQueryDto = z.infer<typeof SearchOpeningsQuerySchema>
export type DifficultyParamDto = z.infer<typeof DifficultyParamSchema>

// Opening-specific DTOs
export type RepertoireIdParamDto = z.infer<typeof RepertoireIdParamSchema>
export type SessionIdParamDto = z.infer<typeof SessionIdParamSchema>
export type RepertoireAndNodeIdParamDto = z.infer<typeof RepertoireAndNodeIdParamSchema>
export type FenParamDto = z.infer<typeof FenParamSchema>
export type PublicRepertoiresQueryDto = z.infer<typeof PublicRepertoiresQuerySchema>
export type UserSessionsQueryDto = z.infer<typeof UserSessionsQuerySchema>
export type PositionsDueQueryDto = z.infer<typeof PositionsDueQuerySchema>

// Opening repertoire DTOs
export type CreateRepertoireRequestDto = z.infer<typeof CreateRepertoireRequestSchema>
export type UpdateRepertoireRequestDto = z.infer<typeof UpdateRepertoireRequestSchema>
export type ImportPgnRequestDto = z.infer<typeof ImportPgnRequestSchema>
export type OpeningMoveDto = z.infer<typeof OpeningMoveSchema>
export type OpeningNodeDto = z.infer<typeof OpeningNodeSchema>
export type RepertoireMetadataDto = z.infer<typeof RepertoireMetadataSchema>

// Authentication DTOs
export type RegisterRequestDto = z.infer<typeof RegisterRequestSchema>
export type LoginRequestDto = z.infer<typeof LoginRequestSchema>
export type RefreshTokenRequestDto = z.infer<typeof RefreshTokenRequestSchema>
export type PasswordResetRequestDto = z.infer<typeof PasswordResetRequestSchema>
export type PasswordResetConfirmRequestDto = z.infer<typeof PasswordResetConfirmRequestSchema>
export type EmailVerificationRequestDto = z.infer<typeof EmailVerificationRequestSchema>
