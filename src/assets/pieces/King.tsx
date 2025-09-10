import type { PieceColor } from "../../components/ChessBoard/types"

interface KingProps {
  color: PieceColor
  className?: string
}

function King({ color, className = "" }: KingProps) {
  const fillColor = color === "white" ? "#f8f9fa" : "#343a40"
  const strokeColor = color === "white" ? "#343a40" : "#343a40"
  const detailStroke = color === "white" ? "#343a40" : "#f8f9fa"

  return (
    <svg
      viewBox="0 0 45 45"
      className={`chess-piece chess-piece--king ${className}`}
      fill="none"
      fillRule="evenodd"
      stroke={strokeColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    >
      <g strokeWidth="1">
        <path d="m22.5 3 3.464 6h-6.928z" />
        <path d="m22.5 11-3.464-6h6.928z" />
      </g>
      <path
        fill={fillColor}
        strokeLinecap="butt"
        strokeLinejoin="miter"
        d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
      />
      <path
        fill={fillColor}
        d="M12.5 37c5.5 3.5 14.5 3.5 20 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5z"
      />
      <path stroke={detailStroke} d="M12.5 30c5.5-3 14.5-3 20 0m-20 3.5c5.5-3 14.5-3 20 0m-20 3.5c5.5-3 14.5-3 20 0" />
    </svg>
  )
}

export default King
