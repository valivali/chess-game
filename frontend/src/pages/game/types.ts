import type { ChessBoard, PieceColor, Position } from "../../components/ChessBoard/ChessBoard.types.ts"

export const GAME_STATUS = {
  ACTIVE: "active",
  CHECK: "check",
  CHECKMATE: "checkmate",
  DRAW: "draw"
} as const

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS]

export interface GameState {
  board: ChessBoard
  currentPlayer: PieceColor
  selectedSquare: Position | null
  validMoves: Position[]
  gameStatus: GameStatus
}
