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
  userId?: string // Optional for guest users
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
  whitePlayerId?: string // User ID or guest identifier
  blackPlayerId?: string // For multiplayer games
  playerName?: string // For guest users
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

// Game list types for pagination
export interface GameListItem {
  id: string
  opponentName: string
  moveCount: number
  currentPlayer: PieceColor
  status: GameStatus
  lastMove: Date
  userColor: PieceColor
  createdAt: Date
  updatedAt: Date
}

export interface GameHistoryItem {
  id: string
  opponentName: string
  result: "win" | "loss" | "draw"
  endReason: "checkmate" | "stalemate" | "draw" | "resignation" | "timeout"
  moveCount: number
  duration: number // in minutes
  completedAt: Date
  userColor: PieceColor
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationInfo
}
