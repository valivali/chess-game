import {
  Game,
  GAME_STATUS,
  HistoricalMove,
  Move,
  MoveHistory,
  MoveResult,
  PIECE_COLOR,
  Position
} from '@/types/gameTypes'
import { MoveServiceInterface } from './moveService.interface'

export class MoveService implements MoveServiceInterface {
  private moveHistories: Map<string, MoveHistory> = new Map()

  constructor() {}

  async makeMove(game: Game, from: Position, to: Position, playerId: string): Promise<MoveResult> {
    if (game.status !== GAME_STATUS.ACTIVE) {
      return {
        success: false,
        game,
        error: 'Game is not active'
      }
    }

    // Basic move validation (simplified for now)
    const piece = game.board[from.x]?.[from.y]
    if (!piece) {
      return {
        success: false,
        game,
        error: 'No piece at source position'
      }
    }

    // Execute the move
    const captured = game.board[to.x]?.[to.y]
    if (game.board[to.x] && game.board[from.x]) {
      game.board[to.x]![to.y] = piece
      game.board[from.x]![from.y] = null
    }

    // Switch players
    game.currentPlayer =
      game.currentPlayer === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE
    game.updatedAt = new Date()

    // Record move in history
    const historicalMove: HistoricalMove = {
      from,
      to,
      piece,
      timestamp: new Date()
    }
    if (captured) {
      historicalMove.captured = captured
    }

    await this.recordMove(game.id, historicalMove)

    const move: Move = {
      from,
      to,
      piece
    }
    if (captured) {
      move.captured = captured
    }

    return {
      success: true,
      game,
      move
    }
  }

  async getMoveHistory(gameId: string): Promise<MoveHistory | null> {
    return this.moveHistories.get(gameId) || null
  }

  async recordMove(gameId: string, move: HistoricalMove): Promise<void> {
    const moveHistory = this.moveHistories.get(gameId)
    if (moveHistory) {
      moveHistory.moves.push(move)
    } else {
      this.moveHistories.set(gameId, { moves: [move] })
    }
  }

  async clearMoveHistory(gameId: string): Promise<void> {
    this.moveHistories.set(gameId, { moves: [] })
  }

  static build(): MoveService {
    return new MoveService()
  }
}
