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

// Export types from schemas
export type CreateGameRequestDto = z.infer<typeof CreateGameRequestSchema>
export type MakeMoveRequestDto = z.infer<typeof MakeMoveRequestSchema>
export type GameIdParamDto = z.infer<typeof GameIdParamSchema>
export type GameResponseDto = z.infer<typeof GameResponseSchema>
export type MoveResultResponseDto = z.infer<typeof MoveResultResponseSchema>
export type GameStatusResponseDto = z.infer<typeof GameStatusResponseSchema>
export type MoveHistoryResponseDto = z.infer<typeof MoveHistoryResponseSchema>
