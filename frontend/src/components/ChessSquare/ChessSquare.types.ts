import React from "react"

import type { Position } from "../ChessBoard/ChessBoard.types.ts"
import type { IChessPiece } from "../pieces/pieces.types.ts"

export interface ChessSquareProps {
  piece: IChessPiece | null
  position: Position
  isLight: boolean
  isSelected: boolean
  isValidMove: boolean
  isHighlighted: boolean
  onClick: (position: Position) => void
  onDragStart: (e: React.DragEvent, piece: IChessPiece, position: Position) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, position: Position) => void
}

export interface ChessSquare {
  piece: IChessPiece | null
  position: Position
  isSelected: boolean
  isValidMove: boolean
  isHighlighted: boolean
}
