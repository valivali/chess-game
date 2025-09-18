import type { ChessBoard, PieceType } from "../../components/ChessBoard/ChessBoard.types"
import { PIECE_COLOR, PIECE_TYPE } from "../../components/ChessBoard/ChessBoard.types"
import { PieceFactory } from "../../components/pieces"

export const createInitialBoard = (): ChessBoard => {
  const board: ChessBoard = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null))

  // Create pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = PieceFactory.createPiece(PIECE_TYPE.PAWN, PIECE_COLOR.BLACK)
    board[6][i] = PieceFactory.createPiece(PIECE_TYPE.PAWN, PIECE_COLOR.WHITE)
  }

  const pieceOrder: PieceType[] = [
    PIECE_TYPE.ROOK,
    PIECE_TYPE.KNIGHT,
    PIECE_TYPE.BISHOP,
    PIECE_TYPE.QUEEN,
    PIECE_TYPE.KING,
    PIECE_TYPE.BISHOP,
    PIECE_TYPE.KNIGHT,
    PIECE_TYPE.ROOK
  ]

  // Create back row pieces
  for (let i = 0; i < 8; i++) {
    board[0][i] = PieceFactory.createPiece(pieceOrder[i], PIECE_COLOR.BLACK)
    board[7][i] = PieceFactory.createPiece(pieceOrder[i], PIECE_COLOR.WHITE)
  }

  return board
}
