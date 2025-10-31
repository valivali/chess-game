import { useMutation, useQueryClient } from "@tanstack/react-query"

import type {
  CreateTrainingSessionRequest,
  ImportPgnRequest,
  OpeningMove,
  OpeningRepertoire,
  TrainingSession
} from "../../types/opening.types"
import { openingApi } from "../opening.api"
import { queryKeys } from "../queryKeys"

export const useCreateRepertoireMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (repertoire: Omit<OpeningRepertoire, "id" | "createdAt" | "updatedAt">) => {
      const response = await openingApi.createRepertoire(repertoire)
      return response.repertoire
    },
    onSuccess: (newRepertoire) => {
      // Add to repertoires cache
      queryClient.setQueryData<OpeningRepertoire[]>(queryKeys.openings.repertoires(), (old) =>
        old ? [newRepertoire, ...old] : [newRepertoire]
      )

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.openings.repertoires() })
    }
  })
}

export const useUpdateRepertoireMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ repertoireId, updates }: { repertoireId: string; updates: Partial<OpeningRepertoire> }) => {
      const response = await openingApi.updateRepertoire(repertoireId, updates)
      return response.repertoire
    },
    onSuccess: (updatedRepertoire) => {
      // Update specific repertoire cache
      queryClient.setQueryData(queryKeys.openings.repertoire(updatedRepertoire.id), updatedRepertoire)

      // Update repertoires list cache
      queryClient.setQueryData<OpeningRepertoire[]>(queryKeys.openings.repertoires(), (old) =>
        old?.map((rep) => (rep.id === updatedRepertoire.id ? updatedRepertoire : rep))
      )
    }
  })
}

export const useDeleteRepertoireMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (repertoireId: string) => {
      await openingApi.deleteRepertoire(repertoireId)
      return repertoireId
    },
    onSuccess: (deletedId) => {
      // Remove from repertoires cache
      queryClient.setQueryData<OpeningRepertoire[]>(queryKeys.openings.repertoires(), (old) => old?.filter((rep) => rep.id !== deletedId))

      // Remove specific repertoire cache
      queryClient.removeQueries({ queryKey: queryKeys.openings.repertoire(deletedId) })

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.openings.progress(deletedId) })
    }
  })
}

export const useImportPgnMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: ImportPgnRequest) => {
      const response = await openingApi.importFromPgn(request)
      return response.result
    },
    onSuccess: (result) => {
      if (result.success && result.repertoire) {
        // Add to repertoires cache
        queryClient.setQueryData<OpeningRepertoire[]>(queryKeys.openings.repertoires(), (old) =>
          old ? [result.repertoire!, ...old] : [result.repertoire!]
        )

        // Invalidate repertoires to refresh
        queryClient.invalidateQueries({ queryKey: queryKeys.openings.repertoires() })
      }
    }
  })
}

export const useStartTrainingSessionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: CreateTrainingSessionRequest) => {
      const response = await openingApi.startTrainingSession(request)
      return response.session
    },
    onSuccess: (newSession) => {
      // Add to sessions cache
      queryClient.setQueryData<TrainingSession[]>(queryKeys.openings.sessions(), (old) => (old ? [newSession, ...old] : [newSession]))

      // Set individual session cache
      queryClient.setQueryData(queryKeys.openings.session(newSession.id), newSession)

      // Invalidate sessions to refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.openings.sessions() })
    }
  })
}

export const useMakeMoveMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ sessionId, move }: { sessionId: string; move: OpeningMove }) => {
      const response = await openingApi.makeMove(sessionId, move)
      return response.result
    },
    onSuccess: (result) => {
      // Update session cache with new state
      queryClient.setQueryData(queryKeys.openings.session(result.session.id), result.session)

      // Update sessions list cache
      queryClient.setQueryData<TrainingSession[]>(queryKeys.openings.sessions(), (old) =>
        old?.map((session) => (session.id === result.session.id ? result.session : session))
      )

      // Invalidate progress queries as they may have changed
      queryClient.invalidateQueries({
        queryKey: queryKeys.openings.progress(result.session.repertoireId)
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.openings.stats() })
    }
  })
}

export const useEndTrainingSessionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await openingApi.endTrainingSession(sessionId)
      return response.session
    },
    onSuccess: (endedSession) => {
      // Update session cache
      queryClient.setQueryData(queryKeys.openings.session(endedSession.id), endedSession)

      // Update sessions list cache
      queryClient.setQueryData<TrainingSession[]>(queryKeys.openings.sessions(), (old) =>
        old?.map((session) => (session.id === endedSession.id ? endedSession : session))
      )

      // Invalidate stats as session completion affects them
      queryClient.invalidateQueries({ queryKey: queryKeys.openings.stats() })
    }
  })
}

export const usePauseTrainingSessionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await openingApi.pauseTrainingSession(sessionId)
      return response.session
    },
    onSuccess: (pausedSession) => {
      // Update session cache
      queryClient.setQueryData(queryKeys.openings.session(pausedSession.id), pausedSession)

      // Update sessions list cache
      queryClient.setQueryData<TrainingSession[]>(queryKeys.openings.sessions(), (old) =>
        old?.map((session) => (session.id === pausedSession.id ? pausedSession : session))
      )
    }
  })
}

export const useResumeTrainingSessionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await openingApi.resumeTrainingSession(sessionId)
      return response.session
    },
    onSuccess: (resumedSession) => {
      // Update session cache
      queryClient.setQueryData(queryKeys.openings.session(resumedSession.id), resumedSession)

      // Update sessions list cache
      queryClient.setQueryData<TrainingSession[]>(queryKeys.openings.sessions(), (old) =>
        old?.map((session) => (session.id === resumedSession.id ? resumedSession : session))
      )
    }
  })
}

export const useTakeBackMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await openingApi.takeBack(sessionId)
      return response.session
    },
    onSuccess: (updatedSession) => {
      // Update session cache
      queryClient.setQueryData(queryKeys.openings.session(updatedSession.id), updatedSession)

      // Update sessions list cache
      queryClient.setQueryData<TrainingSession[]>(queryKeys.openings.sessions(), (old) =>
        old?.map((session) => (session.id === updatedSession.id ? updatedSession : session))
      )
    }
  })
}

export const useResetPositionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await openingApi.resetPosition(sessionId)
      return response.session
    },
    onSuccess: (resetSession) => {
      // Update session cache
      queryClient.setQueryData(queryKeys.openings.session(resetSession.id), resetSession)

      // Update sessions list cache
      queryClient.setQueryData<TrainingSession[]>(queryKeys.openings.sessions(), (old) =>
        old?.map((session) => (session.id === resetSession.id ? resetSession : session))
      )
    }
  })
}
