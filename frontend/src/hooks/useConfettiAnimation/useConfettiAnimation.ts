import { useCallback, useEffect, useRef, useState } from "react"

import { createUniqueId } from "../../utils/id"

export interface ConfettiPiece {
  id: string
  x: number
  y: number
  rotation: number
  color: string
  size: number
  velocityX: number
  velocityY: number
}

interface UseConfettiAnimationProps {
  colors: string[]
  isActive: boolean
  maxParticles?: number
  creationRate?: number
}

export const useConfettiAnimation = ({ colors, isActive, maxParticles = 200, creationRate = 300 }: UseConfettiAnimationProps) => {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])
  const animationFrameRef = useRef<number>(undefined)
  const lastCreationTimeRef = useRef<number>(0)

  const createConfetti = useCallback(() => {
    const newConfetti: ConfettiPiece[] = []
    for (let i = 0; i < 15; i++) {
      newConfetti.push({
        id: createUniqueId("confetti-"),
        x: Math.random() * window.innerWidth,
        y: -10,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        velocityX: (Math.random() - 0.5) * 4,
        velocityY: Math.random() * 3 + 2
      })
    }
    return newConfetti
  }, [colors])

  const animate = useCallback(
    (currentTime: number) => {
      if (!isActive) return

      if (currentTime - lastCreationTimeRef.current >= creationRate) {
        const newConfetti = createConfetti()
        setConfetti((prev) => {
          const updated = [...prev, ...newConfetti]
          return updated.length > maxParticles ? updated.slice(-maxParticles) : updated
        })
        lastCreationTimeRef.current = currentTime
      }

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

      if (isActive) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    },
    [isActive, createConfetti, creationRate, maxParticles]
  )

  useEffect(() => {
    if (isActive) {
      lastCreationTimeRef.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(animate)
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      setConfetti([])
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isActive, animate])

  return confetti
}
