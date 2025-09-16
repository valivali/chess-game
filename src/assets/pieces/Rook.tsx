import type { PieceColor } from "../../components/ChessBoard/ChessBoard.types.ts"

interface RookProps {
  color: PieceColor
  className?: string
}

function Rook({ color, className = "" }: RookProps) {
  const fillColor = color === "white" ? "#f8f9fa" : "#343a40"
  const strokeColor = color === "white" ? "#343a40" : "#343a40"
  const detailStroke = color === "white" ? "#343a40" : "#f8f9fa"

  return (
    <svg
      viewBox="0 0 45 45"
      className={`chess-piece chess-piece--rook ${className}`}
      fill={fillColor}
      fillRule="evenodd"
      stroke={strokeColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    >
      <path strokeLinecap="butt" d="M9 39.3h27v-3H9zM12 36.3v-4h21v4zM11 14.3v-5h4v2h5v-2h5v2h5v-2h4v5" />
      <path d="m34 14.3-3 3H14l-3-3" />
      <path strokeLinecap="butt" strokeLinejoin="miter" d="M31 17.3v12.5H14V17.3" />
      <path d="m31 29.8 1.5 2.5h-20l1.5-2.5" />
      <path fill="none" strokeLinejoin="miter" d="M11 14.3h23" />
      <path fill="none" stroke={detailStroke} strokeWidth="1" strokeLinecap="round" d="M16 20h13M16 23h13M16 26h13" />
    </svg>
  )
}

export default Rook
