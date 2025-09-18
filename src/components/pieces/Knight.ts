import { canMoveTo, executeDefaultMove, getJumpingMoves } from "../../utils/piece"
import type { ChessBoard, PieceColor, PieceType, Position } from "../ChessBoard/ChessBoard.types"
import { PIECE_TYPE, PIECE_WEIGHTS } from "../ChessBoard/ChessBoard.types"
import type { IChessPiece, MoveContext, MoveResult } from "./pieces.types"

const KNIGHT_MOVES = [
  [-2, -1],
  [-2, 1],
  [-1, -2],
  [-1, 2],
  [1, -2],
  [1, 2],
  [2, -1],
  [2, 1]
] as const

export class Knight implements IChessPiece {
  public readonly color: PieceColor

  constructor(color: PieceColor) {
    this.color = color
  }

  get type(): PieceType {
    return PIECE_TYPE.KNIGHT
  }

  get weight(): number {
    return PIECE_WEIGHTS[PIECE_TYPE.KNIGHT]
  }

  getValidMoves(position: Position, board: ChessBoard, _context?: MoveContext): Position[] {
    return getJumpingMoves(position, KNIGHT_MOVES, board, this.color)
  }

  executeMove(from: Position, to: Position, board: ChessBoard, context?: MoveContext): MoveResult {
    return executeDefaultMove(this, from, to, board, context)
  }

  canMoveTo(from: Position, to: Position, board: ChessBoard, context?: MoveContext): boolean {
    return canMoveTo(this, from, to, board, context)
  }

  clone(): IChessPiece {
    return new Knight(this.color)
  }
}
