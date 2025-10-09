import "./Welcome.scss"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { useAuth, useGameContext } from "../../contexts"
import { gameService } from "../../services/gameService"
import GuestWelcome from "./GuestWelcome"

function Welcome() {
  const navigate = useNavigate()
  const { setGameId } = useGameContext()
  const { isAuthenticated, user } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Show guest welcome for unauthenticated users
  if (!isAuthenticated) {
    return <GuestWelcome />
  }

  const handleStartGame = async () => {
    setIsLoading(true)
    setError("")

    try {
      // For authenticated users, use their username from the user object
      const response = await gameService.createGame(user?.username || "Player")
      const gameId = response.data.game.id
      setGameId(gameId)
      navigate(`/game/${gameId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create game")
    } finally {
      setIsLoading(false)
    }
  }

  // Show main welcome screen for authenticated users
  return (
    <div className="welcome__container">
      <Card className="welcome__card">
        <CardHeader className="welcome__header">
          <CardTitle className="welcome__title">Welcome back, {user?.username}!</CardTitle>
          <CardDescription className="welcome__description">
            Ready to continue your chess journey? Start a new game or challenge yourself!
          </CardDescription>
        </CardHeader>
        <CardContent className="welcome__content">
          <div className="welcome__form">
            <Button variant="gradient" size="xl" onClick={handleStartGame} className="welcome__button" disabled={isLoading}>
              {isLoading ? "Creating Game..." : "🎮 Start Game"}
            </Button>

            {error && <p className="welcome__error">{error}</p>}
          </div>

          <p className="welcome__subtitle">Play anytime, anywhere on any device</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Welcome
