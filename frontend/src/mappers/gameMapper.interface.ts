import type { GameData } from "../components/ActiveGamesTable"
import type { HistoryGameData } from "../components/GameHistoryTable"
import type { GameHistoryItem as ApiGameHistoryItem, GameListItem as ApiGameListItem, PaginatedResponse } from "../types"

export interface PaginatedActiveGamesData {
  items: GameData[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PaginatedGameHistoryData {
  items: HistoryGameData[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Interface for game mapping operations
 * Defines the contract for transforming API responses to frontend types
 */
export interface GameMapperInterface {
  /**
   * Maps API GameListItem to frontend GameData
   */
  mapApiGameToGameData(apiGame: ApiGameListItem): GameData

  /**
   * Maps paginated API active games response to frontend format
   */
  mapApiGamesToActiveGamesData(apiResponse: PaginatedResponse<ApiGameListItem>): PaginatedActiveGamesData

  /**
   * Maps API GameHistoryItem to frontend HistoryGameData
   */
  mapApiHistoryToHistoryData(apiHistory: ApiGameHistoryItem): HistoryGameData

  /**
   * Maps paginated API game history response to frontend format
   */
  mapApiHistoryToGameHistoryData(apiResponse: PaginatedResponse<ApiGameHistoryItem>): PaginatedGameHistoryData
}
