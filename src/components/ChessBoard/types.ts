// Piece Type constants and type
export const PIECE_TYPE = {
  PAWN: "pawn",
  ROOK: "rook",
  KNIGHT: "knight",
  BISHOP: "bishop",
  QUEEN: "queen",
  KING: "king"
} as const

export type PieceType = (typeof PIECE_TYPE)[keyof typeof PIECE_TYPE]

// Piece Color constants and type
export const PIECE_COLOR = {
  WHITE: "white",
  BLACK: "black"
} as const

export type PieceColor = (typeof PIECE_COLOR)[keyof typeof PIECE_COLOR]

// Game Status constants and type
export const GAME_STATUS = {
  PLAYING: "playing",
  CHECK: "check",
  CHECKMATE: "checkmate",
  STALEMATE: "stalemate"
} as const

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS]

export interface ChessPiece {
  type: PieceType
  color: PieceColor
}

export interface Position {
  x: number
  y: number
}

export interface ChessSquare {
  piece: ChessPiece | null
  position: Position
  isSelected: boolean
  isValidMove: boolean
  isHighlighted: boolean
}

export type ChessBoard = (ChessPiece | null)[][]
