import { Game, GameStatusInfo, GameListItem, GameHistoryItem, PaginatedResponse } from "@/types/game-types"

export interface GameServiceInterface {
  createGame(playerName?: string, userId?: string): Promise<Game>
  getGame(gameId: string): Promise<Game | null>
  updateGame(game: Game): Promise<Game>
  resetGame(gameId: string): Promise<Game>
  deleteGame(gameId: string): Promise<void>
  getGameStatus(gameId: string): Promise<GameStatusInfo | null>
  getActiveGames(userId: string, page: number, limit: number): Promise<PaginatedResponse<GameListItem>>
  getGameHistory(userId: string, page: number, limit: number): Promise<PaginatedResponse<GameHistoryItem>>
}
