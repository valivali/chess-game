import type { GameEndReason, GameResult, GameStatus, PieceColor } from "../components/ChessBoard/ChessBoard.types"
import type { PaginatedResponse, SuccessResponse } from "./api.types"

export interface CreateGameRequest {
  playerName: string
}

export interface GameDto {
  id: string
  board: (string | null)[][]
  currentPlayer: string
  status: string
  winner: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateGameResponse extends SuccessResponse<{ game: GameDto }> {
  message: string
}

export interface GameListItem {
  id: string
  opponentName: string
  moveCount: number
  currentPlayer: PieceColor
  status: GameStatus
  lastMove: string
  userColor: PieceColor
  createdAt: string
  updatedAt: string
}

export interface GameHistoryItem {
  id: string
  opponentName: string
  result: GameResult
  endReason: GameEndReason
  moveCount: number
  duration: number // in minutes
  completedAt: string
  userColor: PieceColor
}

// API response types
export interface ActiveGamesResponse extends SuccessResponse<PaginatedResponse<GameListItem>> {}

export interface GameHistoryResponse extends SuccessResponse<PaginatedResponse<GameHistoryItem>> {}
