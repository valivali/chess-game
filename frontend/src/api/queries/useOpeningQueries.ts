import { useQuery } from "@tanstack/react-query"

import type { OpeningProgress, OpeningRepertoire, TrainingSession } from "../../types/opening.types"
import { openingApi } from "../opening.api"
import { queryKeys } from "../queryKeys"

export const useRepertoiresQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.openings.repertoires(),
    queryFn: async () => {
      const response = await openingApi.getUserRepertoires()
      return response.repertoires
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false // Repertoires don't change frequently
  })
}

export const useRepertoireQuery = (repertoireId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.openings.repertoire(repertoireId),
    queryFn: async (): Promise<OpeningRepertoire> => {
      const response = await openingApi.getRepertoire(repertoireId)
      return response.repertoire
    },
    enabled: enabled && !!repertoireId,
    staleTime: 10 * 60 * 1000, // 10 minutes - repertoire structure is stable
    refetchOnWindowFocus: false
  })
}

export const usePublicRepertoiresQuery = (tags?: string[], limit?: number, offset?: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.openings.publicRepertoires(tags, limit, offset),
    queryFn: async () => {
      const response = await openingApi.getPublicRepertoires(tags, limit, offset)
      return response.repertoires
    },
    enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes - public repertoires change less frequently
    refetchOnWindowFocus: false
  })
}

export const useTrainingSessionsQuery = (status?: TrainingSession["status"], enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.openings.sessions(),
    queryFn: async () => {
      const response = await openingApi.getUserSessions(status)
      return response.sessions
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes - sessions change more frequently
    refetchOnWindowFocus: true
  })
}

export const useTrainingSessionQuery = (sessionId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.openings.session(sessionId),
    queryFn: async (): Promise<TrainingSession> => {
      const response = await openingApi.getTrainingSession(sessionId)
      return response.session
    },
    enabled: enabled && !!sessionId,
    staleTime: 30 * 1000, // 30 seconds - active sessions change frequently
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds for active sessions
    refetchOnWindowFocus: true
  })
}

export const useRepertoireProgressQuery = (repertoireId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.openings.progress(repertoireId),
    queryFn: async (): Promise<OpeningProgress[]> => {
      const response = await openingApi.getRepertoireProgress(repertoireId)
      return response.progress
    },
    enabled: enabled && !!repertoireId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })
}

export const useReviewPositionsQuery = (repertoireId?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.openings.reviewPositions(repertoireId),
    queryFn: async (): Promise<OpeningProgress[]> => {
      const response = await openingApi.getPositionsDueForReview(repertoireId)
      return response.positions
    },
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute - review positions should be fresh
    refetchOnWindowFocus: true
  })
}

export const useTrainingStatsQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.openings.stats(),
    queryFn: async () => {
      const response = await openingApi.getUserStats()
      return response.stats
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })
}
