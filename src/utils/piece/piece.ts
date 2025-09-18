import type { ChessBoard, PieceColor, Position } from "../../components/ChessBoard/ChessBoard.types"
import type { IChessPiece, MoveContext, MoveResult } from "../../components/pieces/pieces.types"
import { isValidPosition } from "../position"

export function executeDefaultMove(piece: IChessPiece, from: Position, to: Position, board: ChessBoard): MoveResult {
  const capturedPiece = board[to.x][to.y]
  board[to.x][to.y] = piece
  board[from.x][from.y] = null

  return {
    capturedPiece,
    newEnPassantTarget: null
  }
}

export function canMoveTo(piece: IChessPiece, from: Position, to: Position, board: ChessBoard, context?: MoveContext): boolean {
  const validMoves = piece.getValidMoves(from, board, context)
  return validMoves.some((move) => move.x === to.x && move.y === to.y)
}

export function getSlidingMoves(
  position: Position,
  directions: readonly (readonly [number, number])[],
  board: ChessBoard,
  pieceColor: PieceColor
): Position[] {
  const moves: Position[] = []
  const { x, y } = position

  for (const [dx, dy] of directions) {
    const getMovesInDirection = (currentX: number, currentY: number): void => {
      if (!isValidPosition(currentX, currentY)) return

      const targetPiece = board[currentX][currentY]

      if (!targetPiece) {
        moves.push({ x: currentX, y: currentY })
        getMovesInDirection(currentX + dx, currentY + dy)
      } else if (targetPiece.color !== pieceColor) {
        moves.push({ x: currentX, y: currentY })
      }
    }

    getMovesInDirection(x + dx, y + dy)
  }

  return moves
}

export function getJumpingMoves(
  position: Position,
  moves: readonly (readonly [number, number])[],
  board: ChessBoard,
  pieceColor: PieceColor
): Position[] {
  const validMoves: Position[] = []
  const { x, y } = position

  for (const [dx, dy] of moves) {
    const newX = x + dx
    const newY = y + dy

    if (isValidPosition(newX, newY)) {
      const targetPiece = board[newX][newY]
      if (!targetPiece || targetPiece.color !== pieceColor) {
        validMoves.push({ x: newX, y: newY })
      }
    }
  }

  return validMoves
}
