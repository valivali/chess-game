import { useQuery } from "@tanstack/react-query"
import { match } from "ts-pattern"

import type { OpeningDifficulty, OpeningFilter } from "../../types/opening.types"
import { OPENING_DIFFICULTY, OPENING_FILTER, WHITE_OPENING_MOVE } from "../../types/opening.types"
import { getOpeningsByDifficulty, getPopularOpenings, type PopularOpening, searchOpenings } from "../popularOpenings.api"
import { queryKeys } from "../queryKeys"

export const usePopularOpenings = (options?: { minGames?: number; minRating?: number; limit?: number }) => {
  return useQuery({
    queryKey: queryKeys.openings.popular(options),
    queryFn: () => getPopularOpenings(options),
    staleTime: 5 * 60 * 1000, // 5 minutes - opening data doesn't change frequently
    gcTime: 10 * 60 * 1000 // 10 minutes
  })
}

export const useSearchOpenings = (query: string, options?: { limit?: number }, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.openings.search(query, options),
    queryFn: () => searchOpenings(query, options),
    enabled: enabled && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000 // 5 minutes
  })
}

export const useOpeningsByDifficulty = (difficulty: OpeningDifficulty) => {
  return useQuery({
    queryKey: queryKeys.openings.byDifficulty(difficulty),
    queryFn: () => getOpeningsByDifficulty(difficulty),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })
}

export const useAllOpeningsWithFilters = () => {
  const popularQuery = usePopularOpenings({ limit: 100 })

  const filterOpenings = (openings: PopularOpening[] | undefined, filter: OpeningFilter): PopularOpening[] => {
    if (!openings) return []

    const whiteOpeningMoves = Object.values(WHITE_OPENING_MOVE) as string[]

    return match(filter)
      .with(OPENING_FILTER.POPULAR, () => openings.filter((opening) => opening.isPopular))
      .with(OPENING_FILTER.BEGINNER, () => openings.filter((opening) => opening.difficulty === OPENING_DIFFICULTY.BEGINNER))
      .with(OPENING_FILTER.INTERMEDIATE, () => openings.filter((opening) => opening.difficulty === OPENING_DIFFICULTY.INTERMEDIATE))
      .with(OPENING_FILTER.ADVANCED, () => openings.filter((opening) => opening.difficulty === OPENING_DIFFICULTY.ADVANCED))
      .with(OPENING_FILTER.WHITE, () => openings.filter((opening) => whiteOpeningMoves.includes(opening.san)))
      .with(OPENING_FILTER.BLACK, () => openings.filter((opening) => !whiteOpeningMoves.includes(opening.san)))
      .with(OPENING_FILTER.ALL, () => openings)
      .exhaustive()
  }

  return {
    ...popularQuery,
    filterOpenings
  }
}
