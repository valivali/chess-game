import "./ChessSquare.scss"

import React, { memo, useCallback } from "react"

import type { Position } from "../ChessBoard/ChessBoard.types.ts"
import { ChessPiece } from "../ui/chess-piece"
import type { ChessSquareProps } from "./ChessSquare.types.ts"

const CORNER_CLASSES = {
  "0-0": "chess-square--top-left",
  "0-7": "chess-square--top-right",
  "7-0": "chess-square--bottom-left",
  "7-7": "chess-square--bottom-right"
} as const

const getCornerClass = (position: Position): string | null => {
  const key = `${position.x}-${position.y}` as keyof typeof CORNER_CLASSES
  return CORNER_CLASSES[key] || null
}

const BASE_CLASSES = "chess-square"
const LIGHT_CLASS = "chess-square--light"
const DARK_CLASS = "chess-square--dark"
const SELECTED_CLASS = "chess-square--selected"
const VALID_MOVE_CLASS = "chess-square--valid-move"
const HIGHLIGHTED_CLASS = "chess-square--highlighted"

const buildClassName = (
  isLight: boolean,
  isSelected: boolean,
  isValidMove: boolean,
  isHighlighted: boolean,
  cornerClass: string | null
): string => {
  const baseClasses = `${BASE_CLASSES}${isLight ? ` ${LIGHT_CLASS}` : ` ${DARK_CLASS}`}`
  const conditionalClasses = [
    isSelected && SELECTED_CLASS,
    isValidMove && VALID_MOVE_CLASS,
    isHighlighted && HIGHLIGHTED_CLASS,
    cornerClass
  ]
    .filter(Boolean)
    .join(" ")

  return conditionalClasses ? `${baseClasses} ${conditionalClasses}` : baseClasses
}

const ChessSquare = memo(
  ({ piece, position, isLight, isSelected, isValidMove, isHighlighted, onClick, onDragStart, onDragOver, onDrop }: ChessSquareProps) => {
    const handleClick = useCallback(() => onClick(position), [onClick, position])

    const handleDrop = useCallback((e: React.DragEvent) => onDrop(e, position), [onDrop, position])

    const handleDragStart = useCallback(
      (e: React.DragEvent) => {
        if (piece) onDragStart(e, piece, position)
      },
      [onDragStart, piece, position]
    )

    const cornerClass = getCornerClass(position)
    const squareClasses = buildClassName(isLight, isSelected, isValidMove, isHighlighted, cornerClass)

    return (
      <div className={squareClasses} onClick={handleClick} onDragOver={onDragOver} onDrop={handleDrop}>
        {piece && (
          <div draggable onDragStart={handleDragStart} className="chess-piece-container">
            <ChessPiece piece={piece} />
          </div>
        )}
      </div>
    )
  }
)

export default ChessSquare
