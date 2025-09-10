import "./ChessSquare.scss"

import ChessPiece from "../ChessBoard/ChessPiece"
import type { ChessSquareProps } from "./types"

const ChessSquare = ({
  piece,
  position,
  isLight,
  isSelected,
  isValidMove,
  isHighlighted,
  onClick,
  onDragStart,
  onDragOver,
  onDrop
}: ChessSquareProps) => {
  const squareClasses = [
    "chess-square",
    isLight ? "chess-square--light" : "chess-square--dark",
    isSelected && "chess-square--selected",
    isValidMove && "chess-square--valid-move",
    isHighlighted && "chess-square--highlighted"
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={squareClasses} onClick={() => onClick(position)} onDragOver={onDragOver} onDrop={(e) => onDrop(e, position)}>
      {piece && (
        <div draggable onDragStart={(e) => onDragStart(e, piece, position)} className="chess-piece-container">
          <ChessPiece piece={piece} />
        </div>
      )}
    </div>
  )
}

export default ChessSquare
