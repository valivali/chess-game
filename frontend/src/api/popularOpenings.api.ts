import type { OpeningDifficulty } from "../types/opening.types"
import { apiClient } from "./apiClient"

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

export interface PopularOpeningsResponse {
  success: boolean
  data: PopularOpening[]
  count: number
}

export interface SearchOpeningsResponse {
  success: boolean
  data: PopularOpening[]
  count: number
  query: string
}

export interface OpeningsByDifficultyResponse {
  success: boolean
  data: PopularOpening[]
  count: number
  difficulty: string
}

export const getPopularOpenings = async (options?: {
  minGames?: number
  minRating?: number
  limit?: number
}): Promise<PopularOpeningsResponse> => {
  const params = new URLSearchParams()

  if (options?.minGames) {
    params.append("minGames", options.minGames.toString())
  }
  if (options?.minRating) {
    params.append("minRating", options.minRating.toString())
  }
  if (options?.limit) {
    params.append("limit", options.limit.toString())
  }

  const response = await apiClient.get(`/api/opening/popular?${params.toString()}`)
  return response.data
}

export const searchOpenings = async (query: string, options?: { limit?: number }): Promise<SearchOpeningsResponse> => {
  const params = new URLSearchParams()
  params.append("q", query)

  if (options?.limit) {
    params.append("limit", options.limit.toString())
  }

  const response = await apiClient.get(`/api/opening/search?${params.toString()}`)
  return response.data
}

export const getOpeningsByDifficulty = async (difficulty: OpeningDifficulty): Promise<OpeningsByDifficultyResponse> => {
  const response = await apiClient.get(`/api/opening/difficulty/${difficulty}`)
  return response.data
}
