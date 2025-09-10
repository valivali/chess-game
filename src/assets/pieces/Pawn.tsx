import type { PieceColor } from "../../components/ChessBoard/types"

interface PawnProps {
  color: PieceColor
  className?: string
}

function Pawn({ color, className = "" }: PawnProps) {
  const fillColor = color === "white" ? "#f8f9fa" : "#343a40"
  const strokeColor = color === "white" ? "#343a40" : "#343a40"
  const detailStroke = color === "white" ? "#343a40" : "#f8f9fa"

  return (
    <svg viewBox="0 0 45 45" className={`chess-piece chess-piece--pawn ${className}`}>
      <path
        fill={fillColor}
        stroke={strokeColor}
        strokeLinecap="round"
        strokeWidth="1.5"
        d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
      />
      <path fill="none" stroke={detailStroke} strokeWidth="1" d="M18.5 35h8M19.5 32h6" />
    </svg>
  )
}

export default Pawn
