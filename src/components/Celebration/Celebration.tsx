import "./Celebration.scss"

import { useMemo, useState } from "react"

import { useConfettiAnimation } from "../../hooks/useConfettiAnimation/useConfettiAnimation"
import { useFireworkAnimation } from "../../hooks/useFireworkAnimation/useFireworkAnimation"
import type { CelebrationProps } from "./Celebration.types.ts"

const Celebration = ({ winner, onComplete }: CelebrationProps) => {
  const [showCelebration, setShowCelebration] = useState(true)

  const confettiColors = useMemo(
    () =>
      winner === "white"
        ? ["#FFD700", "#FFF8DC", "#F0F8FF", "#E6E6FA", "#FFFACD"]
        : ["#2F2F2F", "#696969", "#A9A9A9", "#C0C0C0", "#1C1C1C"],
    [winner]
  )

  const fireworkColors = useMemo(
    () =>
      winner === "white"
        ? ["#FFD700", "#FFA500", "#FF6347", "#FF69B4", "#00CED1"]
        : ["#8A2BE2", "#4B0082", "#9400D3", "#6A0DAD", "#483D8B"],
    [winner]
  )

  const confetti = useConfettiAnimation({
    colors: confettiColors,
    isActive: showCelebration,
    maxParticles: 200,
    creationRate: 300
  })

  const fireworks = useFireworkAnimation({
    colors: fireworkColors,
    isActive: showCelebration,
    maxParticles: 300,
    creationRate: 800
  })

  const handleNewGame = () => {
    setShowCelebration(false)
    onComplete?.()
  }

  if (!showCelebration) return null

  return (
    <div className="celebration-overlay">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.x}px`,
            top: `${piece.y}px`,
            backgroundColor: piece.color,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            transform: `rotate(${piece.rotation}deg)`
          }}
        />
      ))}

      {fireworks.map((particle) => (
        <div
          key={particle.id}
          className="firework-particle"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            backgroundColor: particle.color,
            opacity: particle.life / particle.maxLife,
            boxShadow: `0 0 6px ${particle.color}`
          }}
        />
      ))}

      <div className="celebration-message">
        <h1 className="celebration-title">🎉 {winner === "white" ? "White" : "Black"} Wins! 🎉</h1>
        <p className="celebration-subtitle">Checkmate!</p>
        <button className="celebration-button" onClick={handleNewGame}>
          🎮 New Game
        </button>
      </div>
    </div>
  )
}

export default Celebration
