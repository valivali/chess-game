import { useCallback } from "react"

import type { ChessBoard as ChessBoardType, Position } from "../../components/ChessBoard/ChessBoard.types"
import type { IChessPiece, MoveResult } from "../../components/pieces"

export interface MoveLogicActions {
  executePieceMove: (
    piece: IChessPiece,
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
    (piece: IChessPiece, from: Position, to: Position, board: ChessBoardType, enPassantTarget: Position | null): MoveResult => {
      return piece.executeMove(from, to, board, { enPassantTarget })
    },
    []
  )

  return {
    executePieceMove,
    createBoardCopy
  }
}
