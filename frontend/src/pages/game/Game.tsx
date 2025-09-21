import "./Game.scss"

import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { ChessBoard } from "../../components/ChessBoard"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { useGameContext } from "../../contexts"

function Game() {
  const navigate = useNavigate()
  const { gameId: urlGameId } = useParams<{ gameId?: string }>()
  const { gameId: contextGameId, setGameId, clearGameId } = useGameContext()

  useEffect(() => {
    if (!contextGameId && urlGameId) {
      setGameId(urlGameId)
    }
  }, [contextGameId, urlGameId, setGameId])

  const gameId = contextGameId || urlGameId

  useEffect(() => {
    if (!gameId) {
      navigate("/")
    }
  }, [gameId, navigate])

  const handleBackToWelcome = () => {
    clearGameId()
    navigate("/")
  }

  return (
    <div className="game__container">
      <div className="game__header">
        <Button variant="outline" onClick={handleBackToWelcome} className="game__back-button" size="sm">
          <span className="game__back-arrow">←</span>
          <span className="game__back-text">Back to Welcome</span>
        </Button>
        <h1 className="game__title">♟️ Chess Game {gameId && `(${gameId.slice(0, 8)}...)`}</h1>
        <div className="game__spacer"></div>
      </div>

      <div className="game__content">
        <Card className="game__board-container">
          <CardContent className="game__board-content">
            <ChessBoard />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Game
