import "./Welcome.scss"

import { useNavigate } from "react-router-dom"

import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"

function Welcome() {
  const navigate = useNavigate()

  const handleStartGame = () => {
    navigate("/game")
  }

  return (
    <div className="welcome__container">
      <Card className="welcome__card">
        <CardHeader className="welcome__header">
          <CardTitle className="welcome__title">Welcome to Chess Game</CardTitle>
          <CardDescription className="welcome__description">
            Ready to play an exciting game of chess? Challenge yourself and improve your strategic thinking!
          </CardDescription>
        </CardHeader>
        <CardContent className="welcome__content">
          <Button variant="gradient" size="xl" onClick={handleStartGame} className="welcome__button">
            🎮 Start Game
          </Button>
          <p className="welcome__subtitle">Play anytime, anywhere on any device</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Welcome
