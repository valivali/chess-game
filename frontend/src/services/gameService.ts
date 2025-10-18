import { config } from "../config"
import { GameMappers } from "../mappers"
import type { GameMapperInterface, PaginatedActiveGamesData, PaginatedGameHistoryData } from "../mappers/gameMapper.interface"
import type { ActiveGamesResponse, CreateGameResponse, GameHistoryResponse } from "../types"
import { authService } from "./authService"

class GameService {
  constructor(
    private readonly baseUrl: string,
    private readonly mappers: GameMapperInterface
  ) {}

  async createGame(playerName: string): Promise<CreateGameResponse> {
    const response = await fetch(`${this.baseUrl}/api/game/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ playerName })
    })

    if (!response.ok) {
      throw new Error(`Failed to create game: ${response.statusText}`)
    }

    return await response.json()
  }

  async getActiveGames(page: number = 1, limit: number = 10): Promise<PaginatedActiveGamesData | null> {
    try {
      if (!authService.isAuthenticated()) {
        throw new Error("Authentication required")
      }

      const token = authService.getAccessToken()
      const response = await fetch(`${this.baseUrl}/api/game/active?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch active games: ${response.statusText}`)
      }

      const apiResponse: ActiveGamesResponse = await response.json()
      const transformedResponse = this.mappers.mapApiGamesToActiveGamesData(apiResponse.data)

      return transformedResponse
    } catch (error) {
      console.error("Error fetching active games:", error)
      return null
    }
  }

  async getGameHistory(page: number = 1, limit: number = 10): Promise<PaginatedGameHistoryData | null> {
    try {
      if (!authService.isAuthenticated()) {
        throw new Error("Authentication required")
      }

      const token = authService.getAccessToken()
      const response = await fetch(`${this.baseUrl}/api/game/history?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch game history: ${response.statusText}`)
      }

      const apiResponse: GameHistoryResponse = await response.json()
      const transformedResponse = this.mappers.mapApiHistoryToGameHistoryData(apiResponse.data)

      return transformedResponse
    } catch (error) {
      console.error("Error fetching game history:", error)
      return null
    }
  }

  static build(): GameService {
    return new GameService(config.api.baseUrl, GameMappers.build())
  }
}

export const gameService = GameService.build()
