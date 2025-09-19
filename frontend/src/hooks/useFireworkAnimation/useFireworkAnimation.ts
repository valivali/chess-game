import { useCallback, useEffect, useRef, useState } from "react"

import { createUniqueId } from "../../utils/id"

export interface FireworkParticle {
  id: string
  x: number
  y: number
  velocityX: number
  velocityY: number
  color: string
  life: number
  maxLife: number
}

interface UseFireworkAnimationProps {
  colors: string[]
  isActive: boolean
  maxParticles?: number
  creationRate?: number
}

export const useFireworkAnimation = ({ colors, isActive, maxParticles = 300, creationRate = 800 }: UseFireworkAnimationProps) => {
  const [fireworks, setFireworks] = useState<FireworkParticle[]>([])
  const animationFrameRef = useRef<number>(undefined)
  const lastCreationTimeRef = useRef<number>(0)

  const createFirework = useCallback(() => {
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
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 60,
        maxLife: 60
      })
    }

    return particles
  }, [colors])

  const animate = useCallback(
    (currentTime: number) => {
      if (!isActive) return

      if (currentTime - lastCreationTimeRef.current >= creationRate) {
        const newFirework = createFirework()
        setFireworks((prev) => {
          const updated = [...prev, ...newFirework]
          return updated.length > maxParticles ? updated.slice(-maxParticles) : updated
        })
        lastCreationTimeRef.current = currentTime
      }

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

      if (isActive) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    },
    [isActive, createFirework, creationRate, maxParticles]
  )

  useEffect(() => {
    if (isActive) {
      lastCreationTimeRef.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(animate)
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      setFireworks([])
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isActive, animate])

  return fireworks
}
