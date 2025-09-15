import "./Celebration.scss"

import { useEffect, useMemo, useState } from "react"

import type { CelebrationProps, ConfettiPiece, FireworkParticle } from "./types"

// Unique ID generator
const createUniqueId = (() => {
  let counter = 0
  return (prefix: string = "") => `${prefix}${Date.now()}-${++counter}-${Math.random().toString(36).substr(2, 9)}`
})()

const Celebration = ({ winner, onComplete }: CelebrationProps) => {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])
  const [fireworks, setFireworks] = useState<FireworkParticle[]>([])
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

  useEffect(() => {
    const createConfetti = () => {
      const newConfetti: ConfettiPiece[] = []
      for (let i = 0; i < 15; i++) {
        newConfetti.push({
          id: createUniqueId("confetti-"),
          x: Math.random() * window.innerWidth,
          y: -10,
          rotation: Math.random() * 360,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          size: Math.random() * 8 + 4,
          velocityX: (Math.random() - 0.5) * 4,
          velocityY: Math.random() * 3 + 2
        })
      }
      setConfetti((prev) => {
        const updated = [...prev, ...newConfetti]
        return updated.length > 200 ? updated.slice(-200) : updated
      })
    }

    createConfetti()

    const confettiInterval = setInterval(createConfetti, 300)

    return () => clearInterval(confettiInterval)
  }, [confettiColors])

  useEffect(() => {
    const createFirework = () => {
      const centerX = window.innerWidth / 2 + (Math.random() - 0.5) * 400
      const centerY = window.innerHeight / 2 + (Math.random() - 0.5) * 200
      const particles: FireworkParticle[] = []

      for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2
        const velocity = Math.random() * 4 + 2
        particles.push({
          id: createUniqueId("firework-"),
          x: centerX,
          y: centerY,
          velocityX: Math.cos(angle) * velocity,
          velocityY: Math.sin(angle) * velocity,
          color: fireworkColors[Math.floor(Math.random() * fireworkColors.length)],
          life: 60,
          maxLife: 60
        })
      }

      setFireworks((prev) => {
        const updated = [...prev, ...particles]
        // Keep only the most recent 300 firework particles to prevent infinite accumulation
        return updated.length > 300 ? updated.slice(-300) : updated
      })
    }

    const fireworkInterval = setInterval(createFirework, 800)

    return () => clearInterval(fireworkInterval)
  }, [fireworkColors])

  useEffect(() => {
    const animate = () => {
      setConfetti((prev) =>
        prev
          .map((piece) => ({
            ...piece,
            x: piece.x + piece.velocityX,
            y: piece.y + piece.velocityY,
            rotation: piece.rotation + 2,
            velocityY: piece.velocityY + 0.1 // gravity
          }))
          .filter((piece) => piece.y < window.innerHeight + 50)
      )

      setFireworks((prev) =>
        prev
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.velocityX,
            y: particle.y + particle.velocityY,
            life: particle.life - 1,
            velocityY: particle.velocityY + 0.05
          }))
          .filter((particle) => particle.life > 0)
      )
    }

    const animationFrame = setInterval(animate, 16) // ~60fps

    return () => clearInterval(animationFrame)
  }, [])

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
