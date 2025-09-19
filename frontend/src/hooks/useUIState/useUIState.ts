import { useCallback, useState } from "react"

import type { Move, Position } from "../../components/ChessBoard/ChessBoard.types.ts"
import { isPositionEqual } from "../../utils/position"

export interface UIState {
  showCelebration: boolean
  lastMove: Move | null
}

export interface UIStateActions {
  setShowCelebration: (show: boolean) => void
  setLastMove: (move: Move | null) => void
  isSquareHighlighted: (position: Position) => boolean
  handleCelebrationComplete: () => void
}

interface UseUIStateProps {
  onGameReset?: () => void
}

export const useUIState = ({ onGameReset }: UseUIStateProps = {}): [UIState, UIStateActions] => {
  const [showCelebration, setShowCelebration] = useState(false)
  const [lastMove, setLastMove] = useState<Move | null>(null)

  const isSquareHighlighted = useCallback(
    (position: Position): boolean => {
      if (!lastMove) return false
      return isPositionEqual(lastMove.from, position) || isPositionEqual(lastMove.to, position)
    },
    [lastMove]
  )

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false)
    onGameReset?.()
  }, [onGameReset])

  const state: UIState = {
    showCelebration,
    lastMove
  }

  const actions: UIStateActions = {
    setShowCelebration,
    setLastMove,
    isSquareHighlighted,
    handleCelebrationComplete
  }

  return [state, actions]
}
