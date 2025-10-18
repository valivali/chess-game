import { act, renderHook, waitFor } from "@testing-library/react"

import type { GameData } from "../../components/ActiveGamesTable"
import { GAME_STATUS, PIECE_COLOR } from "../../components/ChessBoard/ChessBoard.types"
import { gameService } from "../../services"
import type { PaginationInfo } from "../../types"
import { useActiveGames } from "./useActiveGames"

// Mock the gameService
jest.mock("../../services", () => ({
  gameService: {
    getActiveGames: jest.fn()
  }
}))

const mockedGameService = gameService as jest.Mocked<typeof gameService>

describe("useActiveGames", () => {
  const mockActiveGames: GameData[] = [
    {
      id: "game1",
      opponentName: "Player1",
      moveCount: 10,
      currentPlayer: PIECE_COLOR.WHITE,
      status: GAME_STATUS.PLAYING,
      lastMove: new Date("2023-10-14T10:00:00Z"),
      userColor: PIECE_COLOR.WHITE
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
    mockedGameService.getActiveGames.mockResolvedValue({
      items: mockActiveGames,
      pagination: mockPagination
    })
  })

  describe("when user is not authenticated", () => {
    it("should not load data initially", () => {
      // Arrange & Act
      const { result } = renderHook(() => useActiveGames(false))

      // Assert
      expect(result.current.activeGames).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(mockedGameService.getActiveGames).not.toHaveBeenCalled()
    })

    it("should not call API when loadGames is called", async () => {
      // Arrange
      const { result } = renderHook(() => useActiveGames(false))

      // Act
      await act(async () => {
        await result.current.loadGames()
      })

      // Assert
      expect(mockedGameService.getActiveGames).not.toHaveBeenCalled()
    })
  })

  describe("when user is authenticated", () => {
    it("should NOT automatically load data on mount - manual control", () => {
      // Arrange & Act
      const { result } = renderHook(() => useActiveGames(true))

      // Assert - no automatic loading
      expect(result.current.activeGames).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(mockedGameService.getActiveGames).not.toHaveBeenCalled()
    })

    it("should load data when initializeData is called manually", async () => {
      // Arrange
      const { result } = renderHook(() => useActiveGames(true))

      // Act - manually initialize data
      await act(async () => {
        await result.current.initializeData()
      })

      // Assert
      expect(mockedGameService.getActiveGames).toHaveBeenCalledWith(1, 10)
      expect(result.current.activeGames).toEqual(mockActiveGames)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.pagination).toEqual(mockPagination)
    })

    it("should set loading state correctly during manual data fetch", async () => {
      // Arrange
      let resolveActiveGames: (value: any) => void
      mockedGameService.getActiveGames.mockReturnValue(
        new Promise((resolve) => {
          resolveActiveGames = resolve
        })
      )

      const { result } = renderHook(() => useActiveGames(true))

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
        resolveActiveGames({ items: mockActiveGames, pagination: mockPagination })
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.activeGames).toEqual(mockActiveGames)
      })
    })

    it("should handle loadGames with specific page", async () => {
      // Arrange
      const { result } = renderHook(() => useActiveGames(true))

      // Act
      await act(async () => {
        await result.current.loadGames(2)
      })

      // Assert
      expect(mockedGameService.getActiveGames).toHaveBeenCalledWith(2, 10)
    })

    it("should handle API errors gracefully", async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {})
      mockedGameService.getActiveGames.mockRejectedValue(new Error("API Error"))
      const { result } = renderHook(() => useActiveGames(true))

      // Act - manually trigger loading
      await act(async () => {
        await result.current.initializeData()
      })

      // Assert
      expect(result.current.activeGames).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith("Failed to load active games:", expect.any(Error))

      consoleSpy.mockRestore()
    })

    it("should handle null responses from API", async () => {
      // Arrange
      mockedGameService.getActiveGames.mockResolvedValue(null)
      const { result } = renderHook(() => useActiveGames(true))

      // Act - manually trigger loading
      await act(async () => {
        await result.current.initializeData()
      })

      // Assert
      expect(result.current.activeGames).toEqual([])
      expect(result.current.isLoading).toBe(false)
    })

    it("should provide clearData function for manual cleanup", () => {
      // Arrange
      const { result } = renderHook(() => useActiveGames(true))

      // Set some data first
      act(() => {
        result.current.initializeData()
      })

      // Act - manually clear data
      act(() => {
        result.current.clearData()
      })

      // Assert
      expect(result.current.activeGames).toEqual([])
      expect(result.current.pagination.page).toBe(1)
    })

    it("should have stable callback references - no unnecessary re-renders", async () => {
      // Arrange
      const mockPage2Response = {
        items: mockActiveGames,
        pagination: { ...mockPagination, page: 2 }
      }
      mockedGameService.getActiveGames.mockResolvedValue(mockPage2Response)

      const { result, rerender } = renderHook(() => useActiveGames(true))

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Capture initial callback references
      const initialLoadGames = result.current.loadGames

      // Act - trigger a pagination change (which updates state)
      await act(async () => {
        await result.current.loadGames(2)
      })

      // Wait for state update
      await waitFor(() => {
        expect(result.current.pagination.page).toBe(2)
      })

      // Force a re-render
      rerender()

      // Assert - callback references should remain the same despite state changes
      expect(result.current.loadGames).toBe(initialLoadGames)
    })

    it("should NOT trigger multiple API calls on pagination - performance test", async () => {
      // Arrange
      const { result } = renderHook(() => useActiveGames(true))

      // Wait for initial load to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Clear mock call history after initial load
      jest.clearAllMocks()

      // Act - paginate to page 2
      await act(async () => {
        await result.current.loadGames(2)
      })

      // Assert - should only call API once for pagination
      expect(mockedGameService.getActiveGames).toHaveBeenCalledTimes(1)
      expect(mockedGameService.getActiveGames).toHaveBeenCalledWith(2, 10)
    })
  })
})
