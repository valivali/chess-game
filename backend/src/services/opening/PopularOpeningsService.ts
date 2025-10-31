import { ChessDataProviderFactory, ChessDataProviderInterface } from "@/providers/chess-data"
import { OPENING_DIFFICULTY, OpeningDifficulty } from "@/types/opening-types"

export interface PopularOpening {
  /** ECO code */
  eco: string
  /** Opening name */
  name: string
  /** First move in UCI notation */
  uci: string
  /** First move in SAN notation */
  san: string
  /** Average rating of players who play this opening */
  averageRating: number
  /** Statistics from master games */
  stats: {
    /** Total games */
    total: number
    /** White wins */
    white: number
    /** Draws */
    draws: number
    /** Black wins */
    black: number
    /** Win percentage for white */
    whiteWinRate: number
    /** Draw percentage */
    drawRate: number
    /** Win percentage for black */
    blackWinRate: number
  }
  /** Difficulty level based on average rating */
  difficulty: OpeningDifficulty
  /** Whether this is a popular opening (based on game count) */
  isPopular: boolean
}

export interface PopularOpeningsServiceInterface {
  getPopularOpenings(options?: { minGames?: number; minRating?: number; limit?: number }): Promise<PopularOpening[]>

  searchOpenings(query: string, options?: { limit?: number }): Promise<PopularOpening[]>

  getOpeningsByDifficulty(difficulty: OpeningDifficulty): Promise<PopularOpening[]>
}

export class PopularOpeningsService implements PopularOpeningsServiceInterface {
  constructor(private readonly chessDataProvider: ChessDataProviderInterface) {}

  async getPopularOpenings(
    options: {
      minGames?: number
      minRating?: number
      limit?: number
    } = {}
  ): Promise<PopularOpening[]> {
    try {
      console.log(`${this.constructor.name}: getPopularOpenings`)
      const startingFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

      const positionData = await this.chessDataProvider.getMasterData(startingFen, {
        moves: options.limit || 50,
        topGames: 5
      })

      const openings: PopularOpening[] = positionData.moves
        .filter(move => {
          const totalGames = move.white + move.draws + move.black
          return totalGames >= (options.minGames || 1000) && move.averageRating >= (options.minRating || 2200)
        })
        .map(move => {
          const totalGames = move.white + move.draws + move.black
          const whiteWinRate = (move.white / totalGames) * 100
          const drawRate = (move.draws / totalGames) * 100
          const blackWinRate = (move.black / totalGames) * 100

          return {
            eco: move.opening?.eco || "Unknown",
            name: move.opening?.name || this.getOpeningNameFromMove(move.san),
            uci: move.uci,
            san: move.san,
            averageRating: move.averageRating,
            stats: {
              total: totalGames,
              white: move.white,
              draws: move.draws,
              black: move.black,
              whiteWinRate: Math.round(whiteWinRate * 100) / 100,
              drawRate: Math.round(drawRate * 100) / 100,
              blackWinRate: Math.round(blackWinRate * 100) / 100
            },
            difficulty: this.calculateDifficulty(move.averageRating),
            isPopular: totalGames >= 50000 // Consider popular if played in 50k+ games
          }
        })
        .sort((a, b) => b.stats.total - a.stats.total) // Sort by popularity
        .slice(0, options.limit || 20)

      return openings
    } catch (error) {
      console.error("Error fetching popular openings:", error)
      throw new Error("Failed to fetch popular openings from chess data provider")
    }
  }

  async searchOpenings(query: string, options: { limit?: number } = {}): Promise<PopularOpening[]> {
    try {
      // For now, get all popular openings and filter client-side
      // In a more sophisticated implementation, we could cache openings
      // or use a dedicated search service
      const allOpenings = await this.getPopularOpenings({ limit: 100 })

      const searchTerm = query.toLowerCase()
      const filteredOpenings = allOpenings.filter(
        opening =>
          opening.name.toLowerCase().includes(searchTerm) ||
          opening.eco.toLowerCase().includes(searchTerm) ||
          opening.san.toLowerCase().includes(searchTerm)
      )

      return filteredOpenings.slice(0, options.limit || 20)
    } catch (error) {
      console.error("Error searching openings:", error)
      throw new Error("Failed to search openings")
    }
  }

  async getOpeningsByDifficulty(difficulty: OpeningDifficulty): Promise<PopularOpening[]> {
    try {
      const allOpenings = await this.getPopularOpenings({ limit: 100 })
      return allOpenings.filter(opening => opening.difficulty === difficulty)
    } catch (error) {
      console.error("Error fetching openings by difficulty:", error)
      throw new Error("Failed to fetch openings by difficulty")
    }
  }

  private calculateDifficulty(averageRating: number): OpeningDifficulty {
    if (averageRating < 1500) {
      return OPENING_DIFFICULTY.BEGINNER
    }
    if (averageRating < 2500) {
      return OPENING_DIFFICULTY.INTERMEDIATE
    }
    return OPENING_DIFFICULTY.ADVANCED
  }

  private getOpeningNameFromMove(san: string): string {
    // Fallback opening names for common first moves
    const moveNames: Record<string, string> = {
      e4: "King's Pawn Game",
      d4: "Queen's Pawn Game",
      Nf3: "Zukertort Opening",
      c4: "English Opening",
      g3: "Hungarian Opening",
      b3: "Nimzo-Larsen Attack",
      f4: "Bird Opening",
      Nc3: "Van Geet Opening",
      b4: "Polish Opening"
    }

    return moveNames[san] || `${san} Opening`
  }

  static build(): PopularOpeningsService {
    return new PopularOpeningsService(ChessDataProviderFactory.getDefaultProvider())
  }
}
