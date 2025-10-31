import "./Training.scss"

import { useNavigate } from "react-router-dom"

import { ConnectedHeader } from "../../components/ConnectedHeader"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { useAuth } from "../../contexts"

interface TrainingOption {
  id: string
  title: string
  description: string
  route: string
  icon: string
  color: string
}

const trainingOptions: TrainingOption[] = [
  {
    id: "openings",
    title: "Chess Openings",
    description: "Master the most important opening principles and popular opening systems",
    route: "/training/openings",
    icon: "♔",
    color: "emerald"
  },
  {
    id: "tactics",
    title: "Tactics and Traps",
    description: "Sharpen your tactical vision with puzzles, combinations, and common traps",
    route: "/training/tactics",
    icon: "⚔️",
    color: "orange"
  },
  {
    id: "coach",
    title: "Play with Coach",
    description: "Practice with AI guidance and receive personalized feedback on your moves",
    route: "/training/coach",
    icon: "🎓",
    color: "blue"
  }
]

function Training() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleMenuToggle = () => {
    console.log("Menu toggled")
  }

  const handleNavigate = (link: string) => {
    navigate(link)
  }

  const handleOptionClick = (route: string) => {
    navigate(route)
  }

  const handleBackToWelcome = () => {
    navigate("/")
  }

  return (
    <div className="training">
      <ConnectedHeader user={user} onMenuToggle={handleMenuToggle} onNavigate={handleNavigate} />

      <main className="training__main">
        <div className="training__container">
          <div className="training__header">
            <Button variant="outline" onClick={handleBackToWelcome} className="training__back-button" size="sm">
              <span className="training__back-arrow">←</span>
              <span className="training__back-text">Back to Welcome</span>
            </Button>

            <div className="training__title-section">
              <h1 className="training__title">🎯 Chess Training</h1>
              <p className="training__subtitle">Improve your chess skills with structured training modules</p>
            </div>
          </div>

          <div className="training__options-grid">
            {trainingOptions.map((option) => (
              <Card
                key={option.id}
                className={`training__option-card training__option-card--${option.color}`}
                onClick={() => handleOptionClick(option.route)}
              >
                <CardHeader className="training__option-header">
                  <div className="training__option-icon">{option.icon}</div>
                  <CardTitle className="training__option-title">{option.title}</CardTitle>
                </CardHeader>
                <CardContent className="training__option-content">
                  <CardDescription className="training__option-description">{option.description}</CardDescription>
                  <Button variant="outline" className="training__option-button" size="sm">
                    Start Training
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Training
