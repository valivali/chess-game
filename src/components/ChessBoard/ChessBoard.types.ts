// Import the new piece interface
import type { IChessPiece } from "../pieces"

export const PIECE_TYPE = {
  PAWN: "pawn",
  ROOK: "rook",
  KNIGHT: "knight",
  BISHOP: "bishop",
  QUEEN: "queen",
  KING: "king"
} as const

export type PieceType = (typeof PIECE_TYPE)[keyof typeof PIECE_TYPE]

export const PIECE_COLOR = {
  WHITE: "white",
  BLACK: "black"
} as const

export type PieceColor = (typeof PIECE_COLOR)[keyof typeof PIECE_COLOR]

export const GAME_STATUS = {
  PLAYING: "playing",
  CHECK: "check",
  CHECKMATE: "checkmate",
  STALEMATE: "stalemate"
} as const

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS]

export const PIECE_WEIGHTS = {
  [PIECE_TYPE.PAWN]: 1,
  [PIECE_TYPE.BISHOP]: 3,
  [PIECE_TYPE.KNIGHT]: 3,
  [PIECE_TYPE.ROOK]: 5,
  [PIECE_TYPE.QUEEN]: 9,
  [PIECE_TYPE.KING]: 0
} as const

// Legacy ChessPiece interface - kept for backward compatibility
// New code should use IChessPiece from lib/pieces
export interface ChessPiece {
  type: PieceType
  color: PieceColor
  weight: number
}

export interface Position {
  x: number
  y: number
}

export interface Move {
  from: Position
  to: Position
}

export type ChessBoard = (IChessPiece | null)[][]

export const CASTLING_SIDE = {
  KINGSIDE: "kingside",
  QUEENSIDE: "queenside"
} as const

export type CastlingSide = (typeof CASTLING_SIDE)[keyof typeof CASTLING_SIDE]

export interface CastlingRights {
  white: {
    kingside: boolean
    queenside: boolean
  }
  black: {
    kingside: boolean
    queenside: boolean
  }
}
