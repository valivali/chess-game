import "../shared.scss"

import { useNavigate } from "react-router-dom"

import { ConnectedHeader } from "../../../components/ConnectedHeader"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { useAuth } from "../../../contexts"

function TacticsAndTraps() {
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
    <div className="tactics-and-traps">
      <ConnectedHeader user={user} onMenuToggle={handleMenuToggle} onNavigate={handleNavigate} />

      <main className="tactics-and-traps__main">
        <div className="tactics-and-traps__container">
          <div className="tactics-and-traps__header">
            <Button variant="outline" onClick={handleBackToTraining} className="tactics-and-traps__back-button" size="sm">
              <span>←</span>
              <span>Back to Training</span>
            </Button>

            <div className="tactics-and-traps__title-section">
              <h1 className="tactics-and-traps__title">⚔️ Tactics and Traps</h1>
              <p className="tactics-and-traps__subtitle">Sharpen your tactical vision with puzzles, combinations, and common traps</p>
            </div>
          </div>

          <div className="tactics-and-traps__content">
            <Card className="tactics-and-traps__placeholder">
              <CardHeader>
                <CardTitle>Coming Soon!</CardTitle>
                <CardDescription>This training module is currently under development.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  We're working on bringing you an extensive collection of tactical puzzles, combination training, and lessons on common
                  chess traps to help you improve your tactical awareness and calculation skills.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TacticsAndTraps
