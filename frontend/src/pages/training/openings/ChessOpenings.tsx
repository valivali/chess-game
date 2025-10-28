import "../shared.scss"

import { useNavigate } from "react-router-dom"

import { ConnectedHeader } from "../../../components/ConnectedHeader"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { useAuth } from "../../../contexts"

function ChessOpenings() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleMenuToggle = () => {
    console.log("Menu toggled")
  }

  const handleNavigate = (link: string) => {
    navigate(link)
  }

  const handleBackToTraining = () => {
    navigate("/training")
  }

  return (
    <div className="chess-openings">
      <ConnectedHeader user={user!} onMenuToggle={handleMenuToggle} onNavigate={handleNavigate} />

      <main className="chess-openings__main">
        <div className="chess-openings__container">
          <div className="chess-openings__header">
            <Button variant="outline" onClick={handleBackToTraining} className="chess-openings__back-button" size="sm">
              <span>←</span>
              <span>Back to Training</span>
            </Button>

            <div className="chess-openings__title-section">
              <h1 className="chess-openings__title">♔ Chess Openings</h1>
              <p className="chess-openings__subtitle">Master the most important opening principles and popular opening systems</p>
            </div>
          </div>

          <div className="chess-openings__content">
            <Card className="chess-openings__placeholder">
              <CardHeader>
                <CardTitle>Coming Soon!</CardTitle>
                <CardDescription>This training module is currently under development.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  We're working on bringing you comprehensive chess opening training that will help you understand opening principles, learn
                  popular opening systems, and improve your early game strategy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ChessOpenings
