import type { PieceColor } from "../../components/ChessBoard/ChessBoard.types.ts"

interface BishopProps {
  color: PieceColor
  className?: string
}

function Bishop({ color, className = "" }: BishopProps) {
  const fillColor = color === "white" ? "#f8f9fa" : "#343a40"
  const strokeColor = color === "white" ? "#343a40" : "#343a40"
  const detailStroke = color === "white" ? "#343a40" : "#f8f9fa"

  return (
    <svg
      viewBox="0 0 45 45"
      className={`chess-piece chess-piece--bishop ${className}`}
      fill="none"
      fillRule="evenodd"
      stroke={strokeColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    >
      <g fill={fillColor} strokeLinecap="butt">
        <path d="M9 36.6c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z" />
        <path d="M15 32.6c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
        <path d="M25 8.6a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
      </g>
      <path stroke={detailStroke} strokeLinejoin="miter" d="M17.5 26.6h10m-12.5 4h15m-7.5-14.5v5M20 18.6h5" />
    </svg>
  )
}

export default Bishop
