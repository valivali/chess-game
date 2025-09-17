import type { ChessBoard, PieceType } from "../../components/ChessBoard/ChessBoard.types"
import { PIECE_COLOR, PIECE_TYPE, PIECE_WEIGHTS } from "../../components/ChessBoard/ChessBoard.types"

export const createInitialBoard = (): ChessBoard => {
  const board: ChessBoard = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null))

  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: PIECE_TYPE.PAWN, color: PIECE_COLOR.BLACK, weight: PIECE_WEIGHTS[PIECE_TYPE.PAWN] }
    board[6][i] = { type: PIECE_TYPE.PAWN, color: PIECE_COLOR.WHITE, weight: PIECE_WEIGHTS[PIECE_TYPE.PAWN] }
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

  for (let i = 0; i < 8; i++) {
    board[0][i] = { type: pieceOrder[i], color: PIECE_COLOR.BLACK, weight: PIECE_WEIGHTS[pieceOrder[i]] }
    board[7][i] = { type: pieceOrder[i], color: PIECE_COLOR.WHITE, weight: PIECE_WEIGHTS[pieceOrder[i]] }
  }

  return board
}
