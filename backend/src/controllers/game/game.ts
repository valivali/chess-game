import { NextFunction, Request, Response } from "express"
import { GameService } from "@/services/game/game"
import { GameServiceInterface } from "@/services/game/game.interface"
import { MoveService } from "@/services/move/move"
import { MoveServiceInterface } from "@/services/move/move.interface"
import { ResponseFormatter } from "@/utils/response-formatter"
import { GameConverters } from "@/converters/game-converters"
import { CreateGameRequestDto, GameIdParamDto, MakeMoveRequestDto } from "@/validation/schemas"

export class GameController {
  constructor(
    private readonly gameService: GameServiceInterface,
    private readonly moveService: MoveServiceInterface
  ) {}

  async createGame(req: Request<{}, {}, CreateGameRequestDto>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { playerName } = req.body
      const sanitizedPlayerName = GameConverters.sanitizePlayerName(playerName)

      // Get user ID from JWT token if authenticated
      const userId = req.user?.userId

      const game = await this.gameService.createGame(sanitizedPlayerName, userId)

      await this.moveService.clearMoveHistory(game.id)

      const gameDto = GameConverters.gameToDto(game)
      ResponseFormatter.created(res, { game: gameDto }, "Game created successfully")
    } catch (error) {
      next(error)
    }
  }

  async getGame(req: Request<GameIdParamDto>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { gameId } = req.params
      const sanitizedGameId = GameConverters.sanitizeGameId(gameId)

      const game = await this.gameService.getGame(sanitizedGameId)

      if (!game) {
        ResponseFormatter.notFound(res, "Game not found")
        return
      }

      const gameDto = GameConverters.gameToDto(game)
      ResponseFormatter.success(res, { game: gameDto })
    } catch (error) {
      next(error)
    }
  }

  async makeMove(req: Request<GameIdParamDto, {}, MakeMoveRequestDto>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { gameId } = req.params
      const { from, to, playerId } = req.body

      const sanitizedGameId = GameConverters.sanitizeGameId(gameId)

      const game = await this.gameService.getGame(sanitizedGameId)
      if (!game) {
        ResponseFormatter.notFound(res, "Game not found")
        return
      }

      const result = await this.moveService.makeMove(game, from, to, playerId)

      if (result.success) {
        // Update the game state
        await this.gameService.updateGame(result.game)
      }

      const resultDto = GameConverters.moveResultToDto(result)
      ResponseFormatter.success(res, { result: resultDto })
    } catch (error) {
      next(error)
    }
  }

  async resetGame(req: Request<GameIdParamDto>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { gameId } = req.params
      const sanitizedGameId = GameConverters.sanitizeGameId(gameId)

      const game = await this.gameService.resetGame(sanitizedGameId)

      // Clear move history for the reset game
      await this.moveService.clearMoveHistory(sanitizedGameId)

      const gameDto = GameConverters.gameToDto(game)
      ResponseFormatter.success(res, { game: gameDto })
    } catch (error) {
      next(error)
    }
  }

  async deleteGame(req: Request<GameIdParamDto>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { gameId } = req.params
      const sanitizedGameId = GameConverters.sanitizeGameId(gameId)

      await this.gameService.deleteGame(sanitizedGameId)

      // Clear move history for the deleted game
      await this.moveService.clearMoveHistory(sanitizedGameId)

      ResponseFormatter.noContent(res)
    } catch (error) {
      next(error)
    }
  }

  async getGameStatus(req: Request<GameIdParamDto>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { gameId } = req.params
      const sanitizedGameId = GameConverters.sanitizeGameId(gameId)

      const status = await this.gameService.getGameStatus(sanitizedGameId)

      if (!status) {
        ResponseFormatter.notFound(res, "Game not found")
        return
      }

      const statusDto = GameConverters.gameStatusToDto(status)
      ResponseFormatter.success(res, { status: statusDto })
    } catch (error) {
      next(error)
    }
  }

  async getMoveHistory(req: Request<GameIdParamDto>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { gameId } = req.params
      const sanitizedGameId = GameConverters.sanitizeGameId(gameId)

      const history = await this.moveService.getMoveHistory(sanitizedGameId)

      if (!history) {
        ResponseFormatter.notFound(res, "Move history not found")
        return
      }

      const historyDto = GameConverters.moveHistoryToDto(history)
      ResponseFormatter.success(res, { history: historyDto })
    } catch (error) {
      next(error)
    }
  }

  static build(): GameController {
    return new GameController(GameService.build(), MoveService.build())
  }
}
