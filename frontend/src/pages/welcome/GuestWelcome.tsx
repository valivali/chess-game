import "./Welcome.scss"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

import { useCreateGame } from "../../api"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { useGameContext } from "../../contexts"

function GuestWelcome() {
  const navigate = useNavigate()
  const { setGameId } = useGameContext()
  const [username, setUsername] = useState("")

  const { createGame, isLoading, error } = useCreateGame()

  const isUsernameValid = username.length > 1
  const isStartGameDisabled = !isUsernameValid || isLoading

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value)
    if (error) {
      error && console.log("Error cleared")
    }
  }

  const handleStartGame = async () => {
    if (!isUsernameValid) {
      return
    }

    try {
      const response = await createGame(username)
      const gameId = response.data.game.id
      setGameId(gameId)
      navigate(`/game/${gameId}`)
    } catch (err) {
      console.error("Failed to create game:", err)
    }
  }

  const handleGoToAuth = () => {
    navigate("/auth")
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
          <div className="welcome__form">
            <div className="welcome__input-group">
              <label htmlFor="username" className="welcome__label">
                Enter your username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Your username..."
                value={username}
                onChange={handleUsernameChange}
                className="welcome__input"
                disabled={isLoading}
                maxLength={50}
              />
              {error && <p className="welcome__error">{error.message}</p>}
            </div>

            <Button variant="gradient" size="xl" onClick={handleStartGame} className="welcome__button" disabled={isStartGameDisabled}>
              {isLoading ? "Creating Game..." : "🎮 Start Game"}
            </Button>
          </div>

          <div className="welcome__divider">
            <span>or</span>
          </div>

          <div className="welcome__auth-actions">
            <Button variant="outline" size="lg" onClick={handleGoToAuth} className="welcome__auth-button" disabled={isLoading}>
              🔐 Sign In / Register
            </Button>
          </div>

          <p className="welcome__auth-benefits">Sign up to save your games, track your progress, and play with friends!</p>

          <p className="welcome__subtitle">Play anytime, anywhere on any device</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default GuestWelcome
