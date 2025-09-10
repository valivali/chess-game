import React from "react"

import type { ChessPiece, Position } from "../ChessBoard/types"

export interface ChessSquareProps {
  piece: ChessPiece | null
  position: Position
  isLight: boolean
  isSelected: boolean
  isValidMove: boolean
  isHighlighted: boolean
  onClick: (position: Position) => void
  onDragStart: (e: React.DragEvent, piece: ChessPiece, position: Position) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, position: Position) => void
}
