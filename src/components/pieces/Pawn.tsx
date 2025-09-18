import type React from "react"

import { Pawn as PawnSVG } from "../../assets/pieces"
import { createPromotedQueen, isEnPassantCapture, isPawnPromotion } from "../../utils/moves"
import { canMoveTo } from "../../utils/piece"
import { isValidPosition } from "../../utils/position"
import type { ChessBoard, PieceColor, PieceType, Position } from "../ChessBoard/ChessBoard.types"
import { PIECE_COLOR, PIECE_TYPE, PIECE_WEIGHTS } from "../ChessBoard/ChessBoard.types"
import type { IChessPiece, MoveContext, MoveResult } from "./pieces.types"

export class Pawn implements IChessPiece {
  public readonly color: PieceColor

  constructor(color: PieceColor) {
    this.color = color
  }

  get type(): PieceType {
    return PIECE_TYPE.PAWN
  }

  get weight(): number {
    return PIECE_WEIGHTS[PIECE_TYPE.PAWN]
  }

  getValidMoves(position: Position, board: ChessBoard, context?: MoveContext): Position[] {
    const moves: Position[] = []
    const { x, y } = position
    const direction = this.color === PIECE_COLOR.WHITE ? -1 : 1
    const startRow = this.color === PIECE_COLOR.WHITE ? 6 : 1

    const oneStep = x + direction
    if (isValidPosition(oneStep, y) && !board[oneStep][y]) {
      moves.push({ x: oneStep, y })

      if (x === startRow) {
        const twoSteps = x + 2 * direction
        if (isValidPosition(twoSteps, y) && !board[twoSteps][y]) {
          moves.push({ x: twoSteps, y })
        }
      }
    }

    const captureY1 = y - 1
    const captureY2 = y + 1

    if (isValidPosition(oneStep, captureY1)) {
      const targetPiece = board[oneStep][captureY1]
      if (targetPiece && targetPiece.color !== this.color) {
        moves.push({ x: oneStep, y: captureY1 })
      }
    }

    if (isValidPosition(oneStep, captureY2)) {
      const targetPiece = board[oneStep][captureY2]
      if (targetPiece && targetPiece.color !== this.color) {
        moves.push({ x: oneStep, y: captureY2 })
      }
    }

    if (context?.enPassantTarget) {
      const enPassantTarget = context.enPassantTarget

      if (y > 0 && enPassantTarget.x === oneStep && enPassantTarget.y === captureY1) {
        const enemyPawn = board[x][captureY1]
        if (enemyPawn && enemyPawn.type === PIECE_TYPE.PAWN && enemyPawn.color !== this.color) {
          moves.push({ x: oneStep, y: captureY1 })
        }
      }

      if (y < 7 && enPassantTarget.x === oneStep && enPassantTarget.y === captureY2) {
        const enemyPawn = board[x][captureY2]
        if (enemyPawn && enemyPawn.type === PIECE_TYPE.PAWN && enemyPawn.color !== this.color) {
          moves.push({ x: oneStep, y: captureY2 })
        }
      }
    }

    return moves
  }

  executeMove(from: Position, to: Position, board: ChessBoard, context?: MoveContext): MoveResult {
    const isEnPassant = isEnPassantCapture(this, from, to, context?.enPassantTarget || null)

    const captured: IChessPiece | null = isEnPassant ? board[from.x][to.y] : board[to.x][to.y]

    if (isEnPassant) {
      board[from.x][to.y] = null
    }

    const pieceToPlace = isPawnPromotion(this, to) ? createPromotedQueen(this.color) : this
    board[to.x][to.y] = pieceToPlace
    board[from.x][from.y] = null

    const newEnPassantTarget =
      Math.abs(to.x - from.x) === 2
        ? {
            x: from.x + (to.x - from.x) / 2,
            y: from.y
          }
        : null

    return {
      capturedPiece: captured,
      newEnPassantTarget
    }
  }

  canMoveTo(from: Position, to: Position, board: ChessBoard, context?: MoveContext): boolean {
    return canMoveTo(this, from, to, board, context)
  }

  clone(): IChessPiece {
    return new Pawn(this.color)
  }

  render(className: string = ""): React.ReactElement {
    return <PawnSVG color={this.color} className={`chess-piece-svg ${className}`} />
  }
}
