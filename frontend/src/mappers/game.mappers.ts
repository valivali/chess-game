import type { GameData } from "../components/ActiveGamesTable"
import type { HistoryGameData } from "../components/GameHistoryTable"
import type { GameHistoryItem as ApiGameHistoryItem, GameListItem as ApiGameListItem, PaginatedResponse } from "../types"
import type { GameMapperInterface, PaginatedActiveGamesData, PaginatedGameHistoryData } from "./gameMapper.interface"

export class GameMappers implements GameMapperInterface {
  mapApiGameToGameData(apiGame: ApiGameListItem): GameData {
    return {
      id: apiGame.id,
      opponentName: apiGame.opponentName,
      moveCount: apiGame.moveCount,
      currentPlayer: apiGame.currentPlayer,
      status: apiGame.status,
      lastMove: new Date(apiGame.lastMove),
      userColor: apiGame.userColor
    }
  }

  mapApiGamesToActiveGamesData(apiResponse: PaginatedResponse<ApiGameListItem>): PaginatedActiveGamesData {
    return {
      items: apiResponse.items.map((item) => this.mapApiGameToGameData(item)),
      pagination: apiResponse.pagination
    }
  }

  mapApiHistoryToHistoryData(apiHistory: ApiGameHistoryItem): HistoryGameData {
    return {
      id: apiHistory.id,
      opponentName: apiHistory.opponentName,
      result: apiHistory.result,
      endReason: apiHistory.endReason,
      moveCount: apiHistory.moveCount,
      duration: apiHistory.duration,
      completedAt: new Date(apiHistory.completedAt),
      userColor: apiHistory.userColor
    }
  }

  mapApiHistoryToGameHistoryData(apiResponse: PaginatedResponse<ApiGameHistoryItem>): PaginatedGameHistoryData {
    return {
      items: apiResponse.items.map((item) => this.mapApiHistoryToHistoryData(item)),
      pagination: apiResponse.pagination
    }
  }

  static build(): GameMappers {
    return new GameMappers()
  }
}
