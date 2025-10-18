import { act, renderHook, waitFor } from "@testing-library/react"

import { GAME_END_REASON, GAME_RESULT, PIECE_COLOR } from "../../components/ChessBoard/ChessBoard.types"
import type { HistoryGameData } from "../../components/GameHistoryTable"
import { gameService } from "../../services"
import type { PaginationInfo } from "../../types"
import { useGameHistory } from "./useGameHistory"

// Mock the gameService
jest.mock("../../services", () => ({
  gameService: {
    getGameHistory: jest.fn()
  }
}))

const mockedGameService = gameService as jest.Mocked<typeof gameService>

describe("useGameHistory", () => {
  const mockGameHistory: HistoryGameData[] = [
    {
      id: "game2",
      opponentName: "Player2",
      result: GAME_RESULT.WIN,
      endReason: GAME_END_REASON.CHECKMATE,
      moveCount: 25,
      duration: 45, // in minutes
      completedAt: new Date("2023-10-13T15:30:00Z"),
      userColor: PIECE_COLOR.BLACK
    }
  ]

  const mockPagination: PaginationInfo = {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockedGameService.getGameHistory.mockResolvedValue({
      items: mockGameHistory,
      pagination: mockPagination
    })
  })

  describe("when user is not authenticated", () => {
    it("should not load data initially", () => {
      // Arrange & Act
      const { result } = renderHook(() => useGameHistory(false))

      // Assert
      expect(result.current.gameHistory).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(mockedGameService.getGameHistory).not.toHaveBeenCalled()
    })

    it("should not call API when loadHistory is called", async () => {
      // Arrange
      const { result } = renderHook(() => useGameHistory(false))

      // Act
      await act(async () => {
        await result.current.loadHistory()
      })

      // Assert
      expect(mockedGameService.getGameHistory).not.toHaveBeenCalled()
    })
  })

  describe("when user is authenticated", () => {
    it("should NOT automatically load data on mount - manual control", () => {
      // Arrange & Act
      const { result } = renderHook(() => useGameHistory(true))

      // Assert - no automatic loading
      expect(result.current.gameHistory).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(mockedGameService.getGameHistory).not.toHaveBeenCalled()
    })

    it("should load data when initializeData is called manually", async () => {
      // Arrange
      const { result } = renderHook(() => useGameHistory(true))

      // Act - manually initialize data
      await act(async () => {
        await result.current.initializeData()
      })

      // Assert
      expect(mockedGameService.getGameHistory).toHaveBeenCalledWith(1, 10)
      expect(result.current.gameHistory).toEqual(mockGameHistory)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.pagination).toEqual(mockPagination)
    })

    it("should set loading state correctly during manual data fetch", async () => {
      // Arrange
      let resolveGameHistory: (value: any) => void
      mockedGameService.getGameHistory.mockReturnValue(
        new Promise((resolve) => {
          resolveGameHistory = resolve
        })
      )

      const { result } = renderHook(() => useGameHistory(true))

      // Act - manually start loading
      act(() => {
        result.current.initializeData()
      })

      // Assert - loading state should be true during fetch
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      // Resolve the promise
      act(() => {
        resolveGameHistory({ items: mockGameHistory, pagination: mockPagination })
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.gameHistory).toEqual(mockGameHistory)
      })
    })

    it("should handle loadHistory with specific page", async () => {
      // Arrange
      const { result } = renderHook(() => useGameHistory(true))

      // Act
      await act(async () => {
        await result.current.loadHistory(3)
      })

      // Assert
      expect(mockedGameService.getGameHistory).toHaveBeenCalledWith(3, 10)
    })

    it("should handle API errors gracefully", async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {})
      mockedGameService.getGameHistory.mockRejectedValue(new Error("API Error"))
      const { result } = renderHook(() => useGameHistory(true))

      // Act - manually trigger loading
      await act(async () => {
        await result.current.initializeData()
      })

      // Assert
      expect(result.current.gameHistory).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith("Failed to load game history:", expect.any(Error))

      consoleSpy.mockRestore()
    })

    it("should handle null responses from API", async () => {
      // Arrange
      mockedGameService.getGameHistory.mockResolvedValue(null)
      const { result } = renderHook(() => useGameHistory(true))

      // Act - manually trigger loading
      await act(async () => {
        await result.current.initializeData()
      })

      // Assert
      expect(result.current.gameHistory).toEqual([])
      expect(result.current.isLoading).toBe(false)
    })

    it("should provide clearData function for manual cleanup", () => {
      // Arrange
      const { result } = renderHook(() => useGameHistory(true))

      // Set some data first
      act(() => {
        result.current.initializeData()
      })

      // Act - manually clear data
      act(() => {
        result.current.clearData()
      })

      // Assert
      expect(result.current.gameHistory).toEqual([])
      expect(result.current.pagination.page).toBe(1)
    })

    it("should have stable callback references - no unnecessary re-renders", async () => {
      // Arrange
      const mockPage2Response = {
        items: mockGameHistory,
        pagination: { ...mockPagination, page: 2 }
      }
      mockedGameService.getGameHistory.mockResolvedValue(mockPage2Response)

      const { result, rerender } = renderHook(() => useGameHistory(true))

      // Wait for initial state
      expect(result.current.isLoading).toBe(false)

      // Capture initial callback references
      const initialLoadHistory = result.current.loadHistory
      const initialInitializeData = result.current.initializeData
      const initialClearData = result.current.clearData

      // Act - trigger a pagination change (which updates state)
      await act(async () => {
        await result.current.loadHistory(2)
      })

      // Wait for state update
      await waitFor(() => {
        expect(result.current.pagination.page).toBe(2)
      })

      // Force a re-render
      rerender()

      // Assert - callback references should remain the same despite state changes
      expect(result.current.loadHistory).toBe(initialLoadHistory)
      expect(result.current.initializeData).toBe(initialInitializeData)
      expect(result.current.clearData).toBe(initialClearData)
    })

    it("should NOT trigger multiple API calls on pagination - performance test", async () => {
      // Arrange
      const { result } = renderHook(() => useGameHistory(true))

      // Act - paginate to page 3
      await act(async () => {
        await result.current.loadHistory(3)
      })

      // Assert - should only call API once for pagination
      expect(mockedGameService.getGameHistory).toHaveBeenCalledTimes(1)
      expect(mockedGameService.getGameHistory).toHaveBeenCalledWith(3, 10)
    })
  })
})
