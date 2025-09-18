import { canMoveTo, getJumpingMoves } from "../../utils/piece"
import type { ChessBoard, PieceColor, PieceType, Position } from "../ChessBoard/ChessBoard.types"
import { CASTLING_SIDE, PIECE_COLOR, PIECE_TYPE, PIECE_WEIGHTS } from "../ChessBoard/ChessBoard.types"
import type { IChessPiece, MoveContext, MoveResult } from "./pieces.types"

const KING_MOVES = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1]
] as const

export class King implements IChessPiece {
  public readonly color: PieceColor

  constructor(color: PieceColor) {
    this.color = color
  }

  get type(): PieceType {
    return PIECE_TYPE.KING
  }

  get weight(): number {
    return PIECE_WEIGHTS[PIECE_TYPE.KING]
  }

  getValidMoves(position: Position, board: ChessBoard, context?: MoveContext): Position[] {
    const regularMoves = getJumpingMoves(position, KING_MOVES, board, this.color)

    if (context?.castlingRights) {
      const castlingMoves = this.getCastlingMoves(board, context.castlingRights)
      return [...regularMoves, ...castlingMoves]
    }

    return regularMoves
  }

  executeMove(from: Position, to: Position, board: ChessBoard, context?: MoveContext): MoveResult {
    const isCastling = this.isCastlingMove(from, to)

    if (isCastling) {
      const side = this.getCastlingSide(from, to)
      const kingRow = this.color === PIECE_COLOR.WHITE ? 7 : 0
      const rookFromCol = side === CASTLING_SIDE.KINGSIDE ? 7 : 0
      const rookToCol = side === CASTLING_SIDE.KINGSIDE ? 5 : 3

      board[to.x][to.y] = this
      board[from.x][from.y] = null

      const rook = board[kingRow][rookFromCol]
      if (rook) {
        board[kingRow][rookToCol] = rook
        board[kingRow][rookFromCol] = null
      }

      return { capturedPiece: null, newEnPassantTarget: null }
    } else {
      const capturedPiece = board[to.x][to.y]
      board[to.x][to.y] = this
      board[from.x][from.y] = null

      return {
        capturedPiece,
        newEnPassantTarget: null
      }
    }
  }

  canMoveTo(from: Position, to: Position, board: ChessBoard, context?: MoveContext): boolean {
    return canMoveTo(this, from, to, board, context)
  }

  clone(): IChessPiece {
    return new King(this.color)
  }

  private isCastlingMove(from: Position, to: Position): boolean {
    const deltaY = Math.abs(to.y - from.y)
    return deltaY === 2
  }

  private getCastlingSide(from: Position, to: Position) {
    return to.y > from.y ? CASTLING_SIDE.KINGSIDE : CASTLING_SIDE.QUEENSIDE
  }

  private getCastlingMoves(board: ChessBoard, castlingRights: any): Position[] {
    const moves: Position[] = []
    const kingRow = this.color === PIECE_COLOR.WHITE ? 7 : 0

    if (this.canCastle(board, CASTLING_SIDE.KINGSIDE, castlingRights)) {
      moves.push({ x: kingRow, y: 6 })
    }

    if (this.canCastle(board, CASTLING_SIDE.QUEENSIDE, castlingRights)) {
      moves.push({ x: kingRow, y: 2 })
    }

    return moves
  }

  private canCastle(board: ChessBoard, side: any, castlingRights: any): boolean {
    const isWhite = this.color === PIECE_COLOR.WHITE
    const kingRow = isWhite ? 7 : 0
    const kingCol = 4

    const rights = isWhite ? castlingRights.white : castlingRights.black
    if (!rights[side]) {
      return false
    }

    const king = board[kingRow][kingCol]
    if (!king || king.type !== PIECE_TYPE.KING || king.color !== this.color) {
      return false
    }

    const rookCol = side === CASTLING_SIDE.KINGSIDE ? 7 : 0

    const rook = board[kingRow][rookCol]
    if (!rook || rook.type !== PIECE_TYPE.ROOK || rook.color !== this.color) {
      return false
    }

    const startCol = Math.min(kingCol, rookCol)
    const endCol = Math.max(kingCol, rookCol)
    const columnsToCheck = Array.from({ length: endCol - startCol - 1 }, (_, i) => startCol + 1 + i)

    if (columnsToCheck.some((col) => board[kingRow][col] !== null)) {
      return false
    }

    return true
  }
}
