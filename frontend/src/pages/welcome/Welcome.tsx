import "./Welcome.scss"

import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useActiveGames, useCreateGame, useGameHistory } from "../../api"
import { ActiveGamesTable } from "../../components/ActiveGamesTable"
import { ConnectedHeader } from "../../components/ConnectedHeader"
import { GameHistoryTable } from "../../components/GameHistoryTable"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { useAuth, useGameContext } from "../../contexts"
import GuestWelcome from "./GuestWelcome"

function Welcome() {
  const navigate = useNavigate()
  const { setGameId } = useGameContext()
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth()

  const [activeGamesPage, setActiveGamesPage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)

  const {
    activeGames,
    pagination: activeGamesPagination,
    isLoading: isLoadingActiveGames
  } = useActiveGames(isAuthenticated, activeGamesPage)

  const { gameHistory, pagination: historyPagination, isLoading: isLoadingHistory } = useGameHistory(isAuthenticated, historyPage)

  const { createGame, isLoading: isCreatingGame, error: createGameError } = useCreateGame()

  const handleActiveGamesPageChange = useCallback((page: number) => {
    setActiveGamesPage(page)
  }, [])

  const handleHistoryPageChange = useCallback((page: number) => {
    setHistoryPage(page)
  }, [])

  const handleStartGame = useCallback(async () => {
    try {
      const response = await createGame(user?.username || "Player")
      const gameId = response.data.game.id
      setGameId(gameId)
      navigate(`/game/${gameId}`)
    } catch (err) {
      console.error("Failed to create game:", err)
    }
  }, [createGame, user?.username, setGameId, navigate])

  const handleMenuToggle = useCallback(() => {
    console.log("Menu toggled")
  }, [])

  const handleGoToTraining = useCallback(() => {
    navigate("/training")
  }, [navigate])

  const handleNavigate = useCallback(
    (link: string) => {
      navigate(link)
    },
    [navigate]
  )

  useEffect(() => {
    if (!isAuthLoading) {
      setActiveGamesPage(1)
      setHistoryPage(1)
    }
  }, [isAuthenticated, isAuthLoading])

  if (isAuthLoading) {
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
      <ConnectedHeader user={user} onMenuToggle={handleMenuToggle} onNavigate={handleNavigate} />

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
                  <Button variant="gradient" size="lg" onClick={handleStartGame} className="welcome__button" disabled={isCreatingGame}>
                    {isCreatingGame ? "Creating Game..." : "🎮 Start New Game"}
                  </Button>

                  <Button variant="outline" size="lg" onClick={handleGoToTraining} className="welcome__button">
                    🎯 Chess Training
                  </Button>

                  {createGameError && <p className="welcome__error">{createGameError.message}</p>}
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
                isCreatingGame={isCreatingGame}
                pagination={activeGamesPagination}
                onPageChange={handleActiveGamesPageChange}
              />
            </div>

            <div className="welcome__table-section">
              <GameHistoryTable
                games={gameHistory}
                isLoading={isLoadingHistory}
                onNewGame={handleStartGame}
                isCreatingGame={isCreatingGame}
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
