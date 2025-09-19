// Enums for better type safety and consistency with frontend
export const PIECE_COLOR = {
  WHITE: "white",
  BLACK: "black"
} as const

export type PieceColor = (typeof PIECE_COLOR)[keyof typeof PIECE_COLOR]

export const PIECE_TYPE = {
  PAWN: "pawn",
  ROOK: "rook",
  KNIGHT: "knight",
  BISHOP: "bishop",
  QUEEN: "queen",
  KING: "king"
} as const

export type PieceType = (typeof PIECE_TYPE)[keyof typeof PIECE_TYPE]

export const GAME_STATUS = {
  ACTIVE: "active",
  CHECKMATE: "checkmate",
  STALEMATE: "stalemate",
  DRAW: "draw"
} as const

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS]

export interface Position {
  x: number
  y: number
}

export interface CreateGameRequest {
  playerName?: string
}

export interface MakeMoveRequest {
  from: Position
  to: Position
  playerId: string
}

export interface Game {
  id: string
  board: (PieceType | null)[][]
  currentPlayer: PieceColor
  status: GameStatus
  winner: PieceColor | null
  createdAt: Date
  updatedAt: Date
}

export interface Move {
  from: Position
  to: Position
  piece: PieceType
  captured?: PieceType
}

export interface MoveResult {
  success: boolean
  game: Game
  move?: Move
  error?: string
}

export interface GameStatusInfo {
  id: string
  status: GameStatus
  currentPlayer: PieceColor
  winner: PieceColor | null
  isInCheck: boolean
  availableMoves: Position[]
}

export interface HistoricalMove {
  from: Position
  to: Position
  piece: PieceType
  captured?: PieceType
  timestamp: Date
}

export interface MoveHistory {
  moves: HistoricalMove[]
}
