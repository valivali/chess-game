import axios, { AxiosInstance } from "axios"
import { ChessDataProviderInterface, ChessPositionData, ChessMoveData, ChessGameData } from "./ChessDataProviderInterface"
import { providersConfig } from "@/config/providers"

export class LichessProvider implements ChessDataProviderInterface {
  private readonly baseUrl: string
  private readonly axiosInstance: AxiosInstance
  private readonly apiToken?: string

  constructor() {
    const config = providersConfig.chessData.providers.lichess
    this.baseUrl = config.baseUrl || "https://explorer.lichess.ovh"
    this.apiToken = config.apiToken || ""

    const headers: Record<string, string> = {
      "User-Agent": "ChessGame-OpeningTrainer/1.0"
    }

    // Add API token if available (for higher rate limits)
    if (this.apiToken) {
      headers["Authorization"] = `Bearer ${this.apiToken}`
    }

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers
    })
  }

  async getPositionData(
    fen: string,
    options: {
      speeds?: string[]
      ratings?: string[]
      since?: string
      until?: string
      moves?: number
      topGames?: number
    } = {}
  ): Promise<ChessPositionData> {
    try {
      const params = new URLSearchParams()
      params.append("fen", fen)

      // Add optional parameters
      if (options.speeds) {
        options.speeds.forEach((speed) => params.append("speeds[]", speed))
      }
      if (options.ratings) {
        options.ratings.forEach((rating) => params.append("ratings[]", rating))
      }
      if (options.since) {
        params.append("since", options.since)
      }
      if (options.until) {
        params.append("until", options.until)
      }
      if (options.moves) {
        params.append("moves", options.moves.toString())
      }
      if (options.topGames) {
        params.append("topGames", options.topGames.toString())
      }

      const response = await this.axiosInstance.get(`/lichess?${params.toString()}`)
      return this.transformLichessResponse(response.data)
    } catch (error) {
      console.error("Error fetching Lichess position data:", error)
      throw new Error("Failed to fetch position data from Lichess")
    }
  }

  async getMasterData(
    fen: string,
    options: {
      since?: number
      until?: number
      moves?: number
      topGames?: number
    } = {}
  ): Promise<ChessPositionData> {
    try {
      const params = new URLSearchParams()
      params.append("fen", fen)

      // Add optional parameters
      if (options.since) {
        params.append("since", options.since.toString())
      }
      if (options.until) {
        params.append("until", options.until.toString())
      }
      if (options.moves) {
        params.append("moves", options.moves.toString())
      }
      if (options.topGames) {
        params.append("topGames", options.topGames.toString())
      }

      const response = await this.axiosInstance.get(`/masters?${params.toString()}`)
      return this.transformLichessResponse(response.data)
    } catch (error) {
      console.error("Error fetching Lichess master data:", error)
      throw new Error("Failed to fetch master data from Lichess")
    }
  }

  async searchOpenings(query: string, limit = 20): Promise<ChessMoveData[]> {
    // Lichess doesn't have a direct search API, so we'll get popular openings
    // and filter them client-side. In a real implementation, we might cache
    // opening data or use a different approach.
    try {
      const startingFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      const data = await this.getMasterData(startingFen, { moves: 50 })

      const searchTerm = query.toLowerCase()
      const filteredMoves = data.moves.filter(
        (move) =>
          move.opening?.name.toLowerCase().includes(searchTerm) ||
          move.opening?.eco.toLowerCase().includes(searchTerm) ||
          move.san.toLowerCase().includes(searchTerm)
      )

      return filteredMoves.slice(0, limit)
    } catch (error) {
      console.error("Error searching Lichess openings:", error)
      throw new Error("Failed to search openings from Lichess")
    }
  }

  getProviderInfo() {
    const config = providersConfig.chessData.providers.lichess
    return {
      name: "Lichess",
      version: "1.0",
      baseUrl: this.baseUrl,
      rateLimit: config.rateLimit
    }
  }

  private transformLichessResponse(data: any): ChessPositionData {
    return {
      white: data.white || 0,
      draws: data.draws || 0,
      black: data.black || 0,
      moves: (data.moves || []).map(
        (move: any): ChessMoveData => ({
          uci: move.uci,
          san: move.san,
          white: move.white || 0,
          draws: move.draws || 0,
          black: move.black || 0,
          averageRating: move.averageRating || 0,
          opening: move.opening
            ? {
                eco: move.opening.eco,
                name: move.opening.name
              }
            : { eco: "", name: "" }
        })
      ),
      topGames: (data.topGames || []).map(
        (game: any): ChessGameData => ({
          id: game.id,
          white: {
            name: game.white?.name || "Unknown",
            rating: game.white?.rating || 0
          },
          black: {
            name: game.black?.name || "Unknown",
            rating: game.black?.rating || 0
          },
          winner: game.winner,
          year: game.year || new Date().getFullYear(),
          month: game.month
        })
      )
    }
  }

  static build(): LichessProvider {
    return new LichessProvider()
  }
}
