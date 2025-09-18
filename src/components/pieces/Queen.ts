import { canMoveTo, executeDefaultMove, getSlidingMoves } from "../../utils/piece"
import type { ChessBoard, PieceColor, PieceType, Position } from "../ChessBoard/ChessBoard.types"
import { PIECE_TYPE, PIECE_WEIGHTS } from "../ChessBoard/ChessBoard.types"
import type { IChessPiece, MoveContext, MoveResult } from "./pieces.types"

const QUEEN_DIRECTIONS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1]
] as const

export class Queen implements IChessPiece {
  public readonly color: PieceColor

  constructor(color: PieceColor) {
    this.color = color
  }

  get type(): PieceType {
    return PIECE_TYPE.QUEEN
  }

  get weight(): number {
    return PIECE_WEIGHTS[PIECE_TYPE.QUEEN]
  }

  getValidMoves(position: Position, board: ChessBoard, _context?: MoveContext): Position[] {
    return getSlidingMoves(position, QUEEN_DIRECTIONS, board, this.color)
  }

  executeMove(from: Position, to: Position, board: ChessBoard, context?: MoveContext): MoveResult {
    return executeDefaultMove(this, from, to, board, context)
  }

  canMoveTo(from: Position, to: Position, board: ChessBoard, context?: MoveContext): boolean {
    return canMoveTo(this, from, to, board, context)
  }

  clone(): IChessPiece {
    return new Queen(this.color)
  }
}
