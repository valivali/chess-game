import "../shared.scss"

import { useNavigate } from "react-router-dom"

import { ConnectedHeader } from "../../../components/ConnectedHeader"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { useAuth } from "../../../contexts"

function PlayWithCoach() {
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
    <div className="play-with-coach">
      <ConnectedHeader user={user!} onMenuToggle={handleMenuToggle} onNavigate={handleNavigate} />

      <main className="play-with-coach__main">
        <div className="play-with-coach__container">
          <div className="play-with-coach__header">
            <Button variant="outline" onClick={handleBackToTraining} className="play-with-coach__back-button" size="sm">
              <span>←</span>
              <span>Back to Training</span>
            </Button>

            <div className="play-with-coach__title-section">
              <h1 className="play-with-coach__title">🎓 Play with Coach</h1>
              <p className="play-with-coach__subtitle">Practice with AI guidance and receive personalized feedback on your moves</p>
            </div>
          </div>

          <div className="play-with-coach__content">
            <Card className="play-with-coach__placeholder">
              <CardHeader>
                <CardTitle>Coming Soon!</CardTitle>
                <CardDescription>This training module is currently under development.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  We're working on bringing you an AI-powered chess coach that will provide real-time guidance, analyze your moves, and help
                  you understand the reasoning behind good chess decisions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PlayWithCoach
