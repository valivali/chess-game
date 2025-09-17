import { useCallback } from "react"
import { match } from "ts-pattern"

import { CASTLING_SIDE, PIECE_COLOR, PIECE_TYPE } from "../../components/ChessBoard"
import type { ChessBoard as ChessBoardType, ChessPiece as ChessPieceType, Position } from "../../components/ChessBoard/ChessBoard.types"
import { createPromotedQueen, getCastlingSide, isCastlingMove, isEnPassantCapture, isPawnPromotion } from "../../utils/moves"

export interface MoveResult {
  capturedPiece: ChessPieceType | null
  newEnPassantTarget: Position | null
}

export interface MoveLogicActions {
  executePieceMove: (
    piece: ChessPieceType,
    from: Position,
    to: Position,
    board: ChessBoardType,
    enPassantTarget: Position | null
  ) => MoveResult
  createBoardCopy: (board: ChessBoardType) => ChessBoardType
}

export const useMoveLogic = (): MoveLogicActions => {
  const createBoardCopy = useCallback((board: ChessBoardType): ChessBoardType => {
    return board.map((row) => [...row])
  }, [])

  const executePieceMove = useCallback(
    (piece: ChessPieceType, from: Position, to: Position, board: ChessBoardType, enPassantTarget: Position | null): MoveResult => {
      return match(piece.type)
        .with(PIECE_TYPE.KING, () => {
          const isCastling = isCastlingMove(from, to, piece)

          if (isCastling) {
            const side = getCastlingSide(from, to)
            const kingRow = piece.color === PIECE_COLOR.WHITE ? 7 : 0
            const rookFromCol = side === CASTLING_SIDE.KINGSIDE ? 7 : 0
            const rookToCol = side === CASTLING_SIDE.KINGSIDE ? 5 : 3

            board[to.x][to.y] = piece
            board[from.x][from.y] = null

            const rook = board[kingRow][rookFromCol]
            if (rook) {
              board[kingRow][rookToCol] = rook
              board[kingRow][rookFromCol] = null
            }

            return { capturedPiece: null, newEnPassantTarget: null }
          } else {
            const captured = board[to.x][to.y]
            board[to.x][to.y] = piece
            board[from.x][from.y] = null
            return { capturedPiece: captured, newEnPassantTarget: null }
          }
        })
        .with(PIECE_TYPE.PAWN, () => {
          const isEnPassant = isEnPassantCapture(piece, from, to, enPassantTarget)
          const captured = isEnPassant ? board[from.x][to.y] : board[to.x][to.y]

          if (isEnPassant) {
            board[from.x][to.y] = null
          }

          const pieceToPlace = isPawnPromotion(piece, to) ? createPromotedQueen(piece.color) : piece
          board[to.x][to.y] = pieceToPlace
          board[from.x][from.y] = null

          const newEnPassantTargetForPawn =
            Math.abs(to.x - from.x) === 2
              ? {
                  x: from.x + (to.x - from.x) / 2,
                  y: from.y
                }
              : null

          return { capturedPiece: captured, newEnPassantTarget: newEnPassantTargetForPawn }
        })
        .with(PIECE_TYPE.ROOK, PIECE_TYPE.KNIGHT, PIECE_TYPE.BISHOP, PIECE_TYPE.QUEEN, () => {
          const captured = board[to.x][to.y]
          board[to.x][to.y] = piece
          board[from.x][from.y] = null
          return { capturedPiece: captured, newEnPassantTarget: null }
        })
        .exhaustive()
    },
    []
  )

  return {
    executePieceMove,
    createBoardCopy
  }
}
