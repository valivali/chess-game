import { useCallback, useState } from "react"

import {
  useEndTrainingSessionMutation,
  useMakeMoveMutation,
  usePauseTrainingSessionMutation,
  useResetPositionMutation,
  useResumeTrainingSessionMutation,
  useStartTrainingSessionMutation,
  useTakeBackMutation
} from "../../api/mutations"
import { useRepertoiresQuery, useTrainingSessionQuery } from "../../api/queries"
import type { MoveTrainingResult, OpeningMove, OpeningNode, OpeningRepertoire, TrainingSession } from "../../types/opening.types"

interface UseOpeningTrainerState {
  selectedRepertoire: OpeningRepertoire | null
  activeSessionId: string | null
  currentNode: OpeningNode | null
  feedback: string
}

interface UseOpeningTrainerActions {
  selectRepertoire: (repertoire: OpeningRepertoire) => void
  startSession: (repertoireId: string, mode: TrainingSession["mode"]) => Promise<void>
  endSession: () => Promise<void>
  pauseSession: () => Promise<void>
  resumeSession: () => Promise<void>
  makeMove: (move: OpeningMove) => Promise<MoveTrainingResult>
  takeBack: () => Promise<void>
  resetPosition: () => Promise<void>
  clearFeedback: () => void
  setFeedback: (message: string) => void
}

/**
 * React Query-based opening trainer hook
 * Provides state management and actions for the opening trainer
 */
export const useOpeningTrainer = (): [
  {
    // Data from React Query
    repertoires: OpeningRepertoire[] | undefined
    isLoadingRepertoires: boolean
    repertoiresError: Error | null
    session: TrainingSession | undefined
    isLoadingSession: boolean
    sessionError: Error | null

    // Local state
    selectedRepertoire: OpeningRepertoire | null
    currentNode: OpeningNode | null
    feedback: string

    // Mutation states
    isStartingSession: boolean
    isEndingSession: boolean
    isPausingSession: boolean
    isResumingSession: boolean
    isMakingMove: boolean
    isTakingBack: boolean
    isResettingPosition: boolean
  },
  UseOpeningTrainerActions
] => {
  // Local state
  const [state, setState] = useState<UseOpeningTrainerState>({
    selectedRepertoire: null,
    activeSessionId: null,
    currentNode: null,
    feedback: ""
  })

  // Queries
  const { data: repertoires, isLoading: isLoadingRepertoires, error: repertoiresError } = useRepertoiresQuery()

  const {
    data: session,
    isLoading: isLoadingSession,
    error: sessionError
  } = useTrainingSessionQuery(state.activeSessionId || "", !!state.activeSessionId)

  // Mutations
  const startSessionMutation = useStartTrainingSessionMutation()
  const endSessionMutation = useEndTrainingSessionMutation()
  const pauseSessionMutation = usePauseTrainingSessionMutation()
  const resumeSessionMutation = useResumeTrainingSessionMutation()
  const makeMoveMutation = useMakeMoveMutation()
  const takeBackMutation = useTakeBackMutation()
  const resetPositionMutation = useResetPositionMutation()

  // Actions
  const selectRepertoire = useCallback((repertoire: OpeningRepertoire) => {
    setState((prev) => ({
      ...prev,
      selectedRepertoire: repertoire,
      currentNode: repertoire.rootNode,
      feedback: ""
    }))
  }, [])

  const startSession = useCallback(
    async (repertoireId: string, mode: TrainingSession["mode"]) => {
      try {
        const newSession = await startSessionMutation.mutateAsync({
          repertoireId,
          mode
        })

        setState((prev) => ({
          ...prev,
          activeSessionId: newSession.id,
          currentNode: prev.selectedRepertoire?.rootNode || null,
          feedback: "Training session started!"
        }))
      } catch (error) {
        setState((prev) => ({
          ...prev,
          feedback: `Failed to start session: ${error instanceof Error ? error.message : "Unknown error"}`
        }))
        throw error
      }
    },
    [startSessionMutation]
  )

  const endSession = useCallback(async () => {
    if (!state.activeSessionId) return

    try {
      await endSessionMutation.mutateAsync(state.activeSessionId)
      setState((prev) => ({
        ...prev,
        activeSessionId: null,
        currentNode: prev.selectedRepertoire?.rootNode || null,
        feedback: "Session ended"
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        feedback: `Failed to end session: ${error instanceof Error ? error.message : "Unknown error"}`
      }))
      throw error
    }
  }, [state.activeSessionId, endSessionMutation])

  const pauseSession = useCallback(async () => {
    if (!state.activeSessionId) return

    try {
      await pauseSessionMutation.mutateAsync(state.activeSessionId)
      setState((prev) => ({
        ...prev,
        feedback: "Session paused"
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        feedback: `Failed to pause session: ${error instanceof Error ? error.message : "Unknown error"}`
      }))
      throw error
    }
  }, [state.activeSessionId, pauseSessionMutation])

  const resumeSession = useCallback(async () => {
    if (!state.activeSessionId) return

    try {
      await resumeSessionMutation.mutateAsync(state.activeSessionId)
      setState((prev) => ({
        ...prev,
        feedback: "Session resumed"
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        feedback: `Failed to resume session: ${error instanceof Error ? error.message : "Unknown error"}`
      }))
      throw error
    }
  }, [state.activeSessionId, resumeSessionMutation])

  const makeMove = useCallback(
    async (move: OpeningMove): Promise<MoveTrainingResult> => {
      if (!state.activeSessionId) {
        throw new Error("No active training session")
      }

      try {
        const result = await makeMoveMutation.mutateAsync({
          sessionId: state.activeSessionId,
          move
        })

        setState((prev) => ({
          ...prev,
          feedback: result.feedback
        }))

        // Update current node if move was correct
        if (result.isCorrect && state.selectedRepertoire) {
          const newNode = findNodeByFen(state.selectedRepertoire.rootNode, result.nextFen)
          setState((prev) => ({
            ...prev,
            currentNode: newNode
          }))
        }

        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to make move"
        setState((prev) => ({
          ...prev,
          feedback: errorMessage
        }))
        throw error
      }
    },
    [state.activeSessionId, state.selectedRepertoire, makeMoveMutation]
  )

  const takeBack = useCallback(async () => {
    if (!state.activeSessionId) return

    try {
      const updatedSession = await takeBackMutation.mutateAsync(state.activeSessionId)

      // Update current node based on new position
      if (state.selectedRepertoire) {
        const newNode = findNodeByFen(state.selectedRepertoire.rootNode, updatedSession.currentFen)
        setState((prev) => ({
          ...prev,
          currentNode: newNode,
          feedback: "Move taken back"
        }))
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        feedback: `Failed to take back move: ${error instanceof Error ? error.message : "Unknown error"}`
      }))
      throw error
    }
  }, [state.activeSessionId, state.selectedRepertoire, takeBackMutation])

  const resetPosition = useCallback(async () => {
    if (!state.activeSessionId) return

    try {
      await resetPositionMutation.mutateAsync(state.activeSessionId)
      setState((prev) => ({
        ...prev,
        currentNode: prev.selectedRepertoire?.rootNode || null,
        feedback: "Position reset"
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        feedback: `Failed to reset position: ${error instanceof Error ? error.message : "Unknown error"}`
      }))
      throw error
    }
  }, [state.activeSessionId, resetPositionMutation])

  const clearFeedback = useCallback(() => {
    setState((prev) => ({ ...prev, feedback: "" }))
  }, [])

  const setFeedback = useCallback((message: string) => {
    setState((prev) => ({ ...prev, feedback: message }))
  }, [])

  const actions: UseOpeningTrainerActions = {
    selectRepertoire,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    makeMove,
    takeBack,
    resetPosition,
    clearFeedback,
    setFeedback
  }

  return [
    {
      // React Query data
      repertoires,
      isLoadingRepertoires,
      repertoiresError,
      session,
      isLoadingSession,
      sessionError,

      // Local state
      selectedRepertoire: state.selectedRepertoire,
      currentNode: state.currentNode,
      feedback: state.feedback,

      // Mutation states
      isStartingSession: startSessionMutation.isPending,
      isEndingSession: endSessionMutation.isPending,
      isPausingSession: pauseSessionMutation.isPending,
      isResumingSession: resumeSessionMutation.isPending,
      isMakingMove: makeMoveMutation.isPending,
      isTakingBack: takeBackMutation.isPending,
      isResettingPosition: resetPositionMutation.isPending
    },
    actions
  ]
}

// Helper function to find a node by FEN string
function findNodeByFen(rootNode: OpeningNode, fen: string): OpeningNode | null {
  if (rootNode.fen === fen) {
    return rootNode
  }

  for (const child of rootNode.children || []) {
    const found = findNodeByFen(child, fen)
    if (found) {
      return found
    }
  }

  return null
}
