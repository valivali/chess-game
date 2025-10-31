import { Request, Response } from "express"
import { PopularOpeningsService, PopularOpeningsServiceInterface } from "@/services/opening/PopularOpeningsService"
import { DifficultyParamDto, PopularOpeningsQueryDto, SearchOpeningsQueryDto } from "@/validation/schemas"

export class PopularOpeningsController {
  constructor(private readonly popularOpeningsService: PopularOpeningsServiceInterface) {}

  async getPopularOpenings(req: Request, res: Response): Promise<void> {
    try {
      console.log(`${this.constructor.name}: GetPopularOpeningsRequest`)
      const { minGames, minRating, limit } = req.query as unknown as PopularOpeningsQueryDto

      const options: { minGames?: number; minRating?: number; limit?: number } = {}
      if (minGames !== undefined) options.minGames = minGames
      if (minRating !== undefined) options.minRating = minRating
      if (limit !== undefined) options.limit = limit

      const openings = await this.popularOpeningsService.getPopularOpenings(options)

      res.json({
        success: true,
        data: openings,
        count: openings.length
      })
    } catch (error) {
      console.error("Error in getPopularOpenings:", error)
      res.status(500).json({
        success: false,
        error: "Failed to fetch popular openings",
        message: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }

  async searchOpenings(req: Request, res: Response): Promise<void> {
    try {
      const { q: query, limit } = req.query as unknown as SearchOpeningsQueryDto

      const options: { limit?: number } = {}
      if (limit !== undefined) options.limit = limit

      const openings = await this.popularOpeningsService.searchOpenings(query, options)

      res.json({
        success: true,
        data: openings,
        count: openings.length,
        query
      })
    } catch (error) {
      console.error("Error in searchOpenings:", error)
      res.status(500).json({
        success: false,
        error: "Failed to search openings",
        message: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }

  async getOpeningsByDifficulty(req: Request, res: Response): Promise<void> {
    try {
      const { difficulty } = req.params as DifficultyParamDto

      const openings = await this.popularOpeningsService.getOpeningsByDifficulty(difficulty)

      res.json({
        success: true,
        data: openings,
        count: openings.length,
        difficulty
      })
    } catch (error) {
      console.error("Error in getOpeningsByDifficulty:", error)
      res.status(500).json({
        success: false,
        error: "Failed to fetch openings by difficulty",
        message: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }

  static build(): PopularOpeningsController {
    return new PopularOpeningsController(PopularOpeningsService.build())
  }
}
