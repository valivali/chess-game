import { useCallback, useRef, useState } from "react"

import type { HistoryGameData } from "../../components/GameHistoryTable"
import { gameService } from "../../services"
import type { PaginationInfo } from "../../types"

export interface UseGameHistoryReturn {
  gameHistory: HistoryGameData[]
  pagination: PaginationInfo
  isLoading: boolean

  loadHistory: (page?: number) => Promise<void>
  initializeData: () => Promise<void>
  clearData: () => void
}

const DEFAULT_PAGINATION: PaginationInfo = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
}

export const useGameHistory = (isAuthenticated: boolean): UseGameHistoryReturn => {
  const [gameHistory, setGameHistory] = useState<HistoryGameData[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>(DEFAULT_PAGINATION)
  const [isLoading, setIsLoading] = useState(false)

  const paginationRef = useRef(pagination)
  paginationRef.current = pagination

  const loadHistory = useCallback(
    async (page?: number) => {
      if (!isAuthenticated) return

      const targetPage = page ?? paginationRef.current.page
      const limit = paginationRef.current.limit

      try {
        setIsLoading(true)
        const response = await gameService.getGameHistory(targetPage, limit)

        if (response) {
          setGameHistory(response.items)
          setPagination(response.pagination)
        } else {
          setGameHistory([])
          setPagination(DEFAULT_PAGINATION)
        }
      } catch (error) {
        console.error("Failed to load game history:", error)
        setGameHistory([])
        setPagination(DEFAULT_PAGINATION)
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated]
  )

  const initializeData = useCallback(async () => {
    if (!isAuthenticated) return

    if (gameHistory.length === 0 && !isLoading) {
      setPagination(DEFAULT_PAGINATION)
      await loadHistory(1)
    }
  }, [isAuthenticated])

  const clearData = useCallback(() => {
    setGameHistory([])
    setPagination(DEFAULT_PAGINATION)
  }, [])

  return {
    gameHistory,
    pagination,
    isLoading,

    loadHistory,
    initializeData,
    clearData
  }
}
