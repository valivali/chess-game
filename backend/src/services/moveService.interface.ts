import { Game, MoveResult, MoveHistory, Position, HistoricalMove } from "@/types/gameTypes"

export interface MoveServiceInterface {
  makeMove(game: Game, from: Position, to: Position, playerId: string): Promise<MoveResult>
  getMoveHistory(gameId: string): Promise<MoveHistory | null>
  recordMove(gameId: string, move: HistoricalMove): Promise<void>
  clearMoveHistory(gameId: string): Promise<void>
}
