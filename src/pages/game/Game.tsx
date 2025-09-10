import "./Game.scss"

import { useNavigate } from "react-router-dom"

import { ChessBoard } from "../../components/ChessBoard"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"

function Game() {
  const navigate = useNavigate()

  const handleBackToWelcome = () => {
    navigate("/")
  }

  return (
    <div className="game__container">
      <div className="game__header">
        <Button variant="outline" onClick={handleBackToWelcome} className="game__back-button" size="sm">
          <span className="game__back-arrow">←</span>
          <span className="game__back-text">Back to Welcome</span>
        </Button>
        <h1 className="game__title">♟️ Chess Game</h1>
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
