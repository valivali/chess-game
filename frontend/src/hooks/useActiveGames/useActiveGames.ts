import { useCallback, useRef, useState } from "react"

import type { GameData } from "../../components/ActiveGamesTable"
import { gameService } from "../../services"
import type { PaginationInfo } from "../../types"

export interface UseActiveGamesReturn {
  activeGames: GameData[]
  pagination: PaginationInfo
  isLoading: boolean

  loadGames: (page?: number) => Promise<void>
  initializeData: () => Promise<void>
  clearData: () => void
}

const DEFAULT_PAGINATION: PaginationInfo = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
}

export const useActiveGames = (isAuthenticated: boolean): UseActiveGamesReturn => {
  const [activeGames, setActiveGames] = useState<GameData[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>(DEFAULT_PAGINATION)
  const [isLoading, setIsLoading] = useState(false)

  const paginationRef = useRef(pagination)
  paginationRef.current = pagination

  const loadGames = useCallback(
    async (page?: number) => {
      if (!isAuthenticated) return

      const targetPage = page ?? paginationRef.current.page
      const limit = paginationRef.current.limit

      try {
        setIsLoading(true)
        const response = await gameService.getActiveGames(targetPage, limit)

        if (response) {
          setActiveGames(response.items)
          setPagination(response.pagination)
        } else {
          setActiveGames([])
          setPagination(DEFAULT_PAGINATION)
        }
      } catch (error) {
        console.error("Failed to load active games:", error)
        setActiveGames([])
        setPagination(DEFAULT_PAGINATION)
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated]
  )

  const initializeData = useCallback(async () => {
    if (!isAuthenticated) return

    // Only initialize if we don't have data yet
    if (activeGames.length === 0 && !isLoading) {
      setPagination(DEFAULT_PAGINATION)
      await loadGames(1)
    }
  }, [isAuthenticated, loadGames])

  const clearData = useCallback(() => {
    setActiveGames([])
    setPagination(DEFAULT_PAGINATION)
  }, [])

  return {
    activeGames,
    pagination,
    isLoading,

    loadGames,
    initializeData,
    clearData
  }
}
