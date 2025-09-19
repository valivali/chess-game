import type { Position } from "../../components/ChessBoard/ChessBoard.types"

export const createPosition = (x: number, y: number): Position => ({ x, y })

export const getSquareKey = (rowIndex: number, colIndex: number): string => {
  return `${rowIndex}-${colIndex}`
}

export const isLightSquare = (rowIndex: number, colIndex: number): boolean => {
  return (rowIndex + colIndex) % 2 === 0
}

export const indicesToPosition = (rowIndex: number, colIndex: number): Position => {
  return createPosition(rowIndex, colIndex)
}

export const isValidPosition = (x: number, y: number): boolean => {
  return x >= 0 && x < 8 && y >= 0 && y < 8
}

export const isPositionEqual = (pos1: Position, pos2: Position): boolean => {
  return pos1.x === pos2.x && pos1.y === pos2.y
}
