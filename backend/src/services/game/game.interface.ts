import { Game, GameStatusInfo } from "@/types/game-types"

export interface GameServiceInterface {
  createGame(playerName?: string, userId?: string): Promise<Game>
  getGame(gameId: string): Promise<Game | null>
  updateGame(game: Game): Promise<Game>
  resetGame(gameId: string): Promise<Game>
  deleteGame(gameId: string): Promise<void>
  getGameStatus(gameId: string): Promise<GameStatusInfo | null>
}
