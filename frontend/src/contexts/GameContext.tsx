import React, { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react"

interface GameContextType {
  gameId: string | null
  setGameId: (gameId: string | null) => void
  clearGameId: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

interface GameProviderProps {
  children: ReactNode
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameId, setGameIdState] = useState<string | null>(null)

  const setGameId = useCallback((newGameId: string | null) => {
    setGameIdState(newGameId)
  }, [])

  const clearGameId = useCallback(() => {
    setGameIdState(null)
  }, [])

  const value: GameContextType = useMemo(
    () => ({
      gameId,
      setGameId,
      clearGameId
    }),
    [gameId, setGameId, clearGameId]
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider")
  }
  return context
}

export type { GameContextType }
