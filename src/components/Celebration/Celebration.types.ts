export interface CelebrationProps {
  winner: "white" | "black"
  onComplete?: () => void
}

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
