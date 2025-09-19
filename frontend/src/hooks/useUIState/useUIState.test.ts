import { describe, expect, it, jest } from "@jest/globals"
import { act, renderHook } from "@testing-library/react"

import type { Move, Position } from "../../components/ChessBoard/ChessBoard.types"
import { useUIState } from "./useUIState"

describe("useUIState", () => {
  const mockPosition1: Position = { x: 0, y: 0 }
  const mockPosition2: Position = { x: 1, y: 1 }
  const mockMove: Move = { from: mockPosition1, to: mockPosition2 }

  describe("initial state", () => {
    it("should initialize with correct default values", () => {
      const { result } = renderHook(() => useUIState())
      const [state] = result.current

      expect(state.showCelebration).toBe(false)
      expect(state.lastMove).toBeNull()
    })
  })

  describe("celebration management", () => {
    it("should update showCelebration state", () => {
      const { result } = renderHook(() => useUIState())
      const [, actions] = result.current

      act(() => {
        actions.setShowCelebration(true)
      })

      const [state] = result.current
      expect(state.showCelebration).toBe(true)
    })

    it("should call onGameReset when celebration completes", () => {
      const mockOnGameReset = jest.fn()
      const { result } = renderHook(() => useUIState({ onGameReset: mockOnGameReset }))
      const [, actions] = result.current

      act(() => {
        actions.setShowCelebration(true)
      })

      act(() => {
        actions.handleCelebrationComplete()
      })

      const [state] = result.current
      expect(state.showCelebration).toBe(false)
      expect(mockOnGameReset).toHaveBeenCalledTimes(1)
    })

    it("should handle celebration complete without onGameReset callback", () => {
      const { result } = renderHook(() => useUIState())
      const [, actions] = result.current

      act(() => {
        actions.setShowCelebration(true)
      })

      act(() => {
        actions.handleCelebrationComplete()
      })

      const [state] = result.current
      expect(state.showCelebration).toBe(false)
    })
  })

  describe("move tracking", () => {
    it("should update lastMove state", () => {
      const { result } = renderHook(() => useUIState())
      const [, actions] = result.current

      act(() => {
        actions.setLastMove(mockMove)
      })

      const [state] = result.current
      expect(state.lastMove).toEqual(mockMove)
    })

    it("should clear lastMove when set to null", () => {
      const { result } = renderHook(() => useUIState())
      const [, actions] = result.current

      act(() => {
        actions.setLastMove(mockMove)
      })

      act(() => {
        actions.setLastMove(null)
      })

      const [state] = result.current
      expect(state.lastMove).toBeNull()
    })
  })

  describe("square highlighting", () => {
    it("should return false when no lastMove is set", () => {
      const { result } = renderHook(() => useUIState())
      const [, actions] = result.current

      const isHighlighted = actions.isSquareHighlighted(mockPosition1)
      expect(isHighlighted).toBe(false)
    })

    it("should return true for from position when lastMove is set", () => {
      const { result } = renderHook(() => useUIState())

      act(() => {
        const [, actions] = result.current
        actions.setLastMove(mockMove)
      })

      const [, actions] = result.current
      const isHighlighted = actions.isSquareHighlighted(mockPosition1)
      expect(isHighlighted).toBe(true)
    })

    it("should return true for to position when lastMove is set", () => {
      const { result } = renderHook(() => useUIState())

      act(() => {
        const [, actions] = result.current
        actions.setLastMove(mockMove)
      })

      const [, actions] = result.current
      const isHighlighted = actions.isSquareHighlighted(mockPosition2)
      expect(isHighlighted).toBe(true)
    })

    it("should return false for positions not involved in lastMove", () => {
      const { result } = renderHook(() => useUIState())
      const [, actions] = result.current
      const otherPosition: Position = { x: 2, y: 2 }

      act(() => {
        actions.setLastMove(mockMove)
      })

      const isHighlighted = actions.isSquareHighlighted(otherPosition)
      expect(isHighlighted).toBe(false)
    })
  })

  describe("state consistency", () => {
    it("should maintain state consistency across multiple operations", () => {
      const mockOnGameReset = jest.fn()
      const { result } = renderHook(() => useUIState({ onGameReset: mockOnGameReset }))
      const [, actions] = result.current

      act(() => {
        actions.setShowCelebration(true)
        actions.setLastMove(mockMove)
      })

      let [state] = result.current
      expect(state.showCelebration).toBe(true)
      expect(state.lastMove).toEqual(mockMove)

      act(() => {
        actions.handleCelebrationComplete()
      })
      ;[state] = result.current
      expect(state.showCelebration).toBe(false)
      expect(state.lastMove).toEqual(mockMove)
      expect(mockOnGameReset).toHaveBeenCalledTimes(1)
    })
  })
})
