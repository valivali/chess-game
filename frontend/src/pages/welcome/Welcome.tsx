import "./Welcome.scss"

import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { ActiveGamesTable } from "../../components/ActiveGamesTable"
import { ConnectedHeader } from "../../components/ConnectedHeader"
import { GameHistoryTable } from "../../components/GameHistoryTable"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { useAuth, useGameContext } from "../../contexts"
import { useActiveGames } from "../../hooks/useActiveGames"
import { useGameHistory } from "../../hooks/useGameHistory"
import { gameService } from "../../services"
import GuestWelcome from "./GuestWelcome"

function Welcome() {
  const navigate = useNavigate()
  const { setGameId } = useGameContext()
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const {
    activeGames,
    pagination: activeGamesPagination,
    isLoading: isLoadingActiveGames,
    loadGames: loadActiveGames,
    initializeData: initializeActiveGames,
    clearData: clearActiveGames
  } = useActiveGames(isAuthenticated)

  const {
    gameHistory,
    pagination: historyPagination,
    isLoading: isLoadingHistory,
    loadHistory: loadGameHistory,
    initializeData: initializeGameHistory,
    clearData: clearGameHistory
  } = useGameHistory(isAuthenticated)

  const handleActiveGamesPageChange = useCallback(
    (page: number) => {
      loadActiveGames(page)
    },
    [loadActiveGames]
  )

  const handleHistoryPageChange = useCallback(
    (page: number) => {
      loadGameHistory(page)
    },
    [loadGameHistory]
  )

  const handleStartGame = useCallback(async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await gameService.createGame(user?.username || "Player")
      const gameId = response.data.game.id
      setGameId(gameId)
      navigate(`/game/${gameId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create game")
    } finally {
      setIsLoading(false)
    }
  }, [user?.username, setGameId, navigate])

  const handleMenuToggle = useCallback(() => {
    console.log("Menu toggled")
  }, [])

  useEffect(() => {
    console.log("1")
    if (!isAuthLoading) {
      console.log("2")
      if (isAuthenticated) {
        console.log("3")
        initializeActiveGames()
        initializeGameHistory()
      } else {
        clearActiveGames()
        clearGameHistory()
      }
    }
  }, [isAuthenticated, isAuthLoading])

  if (isAuthLoading) {
    console.log("4")
    return (
      <div className="welcome__loading">
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <GuestWelcome />
  }

  return (
    <div className="welcome__authenticated">
      <ConnectedHeader user={user!} onMenuToggle={handleMenuToggle} />

      <main className="welcome__main-dashboard">
        <div className="welcome__dashboard-container">
          <div className="welcome__dashboard-header">
            <Card className="welcome__welcome-card">
              <CardHeader className="welcome__header">
                <CardTitle className="welcome__title">Welcome back, {user?.username}!</CardTitle>
                <CardDescription className="welcome__description">
                  Ready to continue your chess journey? Start a new game or challenge yourself!
                </CardDescription>
              </CardHeader>
              <CardContent className="welcome__content">
                <div className="welcome__form">
                  <Button variant="gradient" size="lg" onClick={handleStartGame} className="welcome__button" disabled={isLoading}>
                    {isLoading ? "Creating Game..." : "🎮 Start New Game"}
                  </Button>

                  {error && <p className="welcome__error">{error}</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="welcome__dashboard-content">
            <div className="welcome__table-section">
              <ActiveGamesTable
                games={activeGames}
                isLoading={isLoadingActiveGames}
                onNewGame={handleStartGame}
                isCreatingGame={isLoading}
                pagination={activeGamesPagination}
                onPageChange={handleActiveGamesPageChange}
              />
            </div>

            <div className="welcome__table-section">
              <GameHistoryTable
                games={gameHistory}
                isLoading={isLoadingHistory}
                onNewGame={handleStartGame}
                isCreatingGame={isLoading}
                pagination={historyPagination}
                onPageChange={handleHistoryPageChange}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Welcome
