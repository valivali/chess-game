import { Game, MoveResult, GameStatusInfo, MoveHistory, Move, HistoricalMove } from "@/types/game-types"
import { GameResponseDto, MoveResultResponseDto, GameStatusResponseDto, MoveHistoryResponseDto } from "@/validation/schemas"

export class GameConverters {
  static gameToDto(game: Game): GameResponseDto {
    return {
      id: game.id,
      board: game.board,
      currentPlayer: game.currentPlayer,
      status: game.status,
      winner: game.winner,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt
    }
  }

  static moveResultToDto(moveResult: MoveResult): MoveResultResponseDto {
    return {
      success: moveResult.success,
      game: this.gameToDto(moveResult.game),
      move: moveResult.move ? this.moveToDto(moveResult.move) : undefined,
      error: moveResult.error
    }
  }

  static gameStatusToDto(gameStatus: GameStatusInfo): GameStatusResponseDto {
    return {
      id: gameStatus.id,
      status: gameStatus.status,
      currentPlayer: gameStatus.currentPlayer,
      winner: gameStatus.winner,
      isInCheck: gameStatus.isInCheck,
      availableMoves: gameStatus.availableMoves
    }
  }

  static moveHistoryToDto(moveHistory: MoveHistory): MoveHistoryResponseDto {
    return {
      moves: moveHistory.moves.map((move) => this.historicalMoveToDto(move))
    }
  }

  private static moveToDto(move: Move) {
    return {
      from: move.from,
      to: move.to,
      piece: move.piece,
      captured: move.captured
    }
  }

  private static historicalMoveToDto(move: HistoricalMove) {
    return {
      from: move.from,
      to: move.to,
      piece: move.piece,
      captured: move.captured,
      timestamp: move.timestamp
    }
  }

  static sanitizeGameId(gameId: string): string {
    const sanitized = gameId.trim()

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(sanitized)) {
      throw new Error("Invalid game ID format")
    }

    return sanitized
  }

  static sanitizePlayerName(playerName?: string): string | undefined {
    if (!playerName) return undefined

    return playerName
      .trim()
      .replace(/[<>\"&]/g, "") // Remove basic XSS characters
      .substring(0, 50)
  }
}
