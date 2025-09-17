import { useCallback } from "react"

import { GAME_STATUS, PIECE_COLOR } from "../../components/ChessBoard"
import type {
  CastlingRights,
  ChessBoard as ChessBoardType,
  GameStatus,
  PieceColor,
  Position
} from "../../components/ChessBoard/ChessBoard.types"
import { isCheckmate, isInCheck, isStalemate } from "../../utils/moves"

export interface GameStatusActions {
  determineGameStatus: (
    board: ChessBoardType,
    player: PieceColor,
    enPassantTarget: Position | null,
    castlingRights: CastlingRights
  ) => GameStatus
  checkForGameEnd: (
    board: ChessBoardType,
    player: PieceColor,
    enPassantTarget: Position | null,
    castlingRights: CastlingRights
  ) => {
    status: GameStatus
    isGameOver: boolean
    winner: PieceColor | null
  }
}

export const useGameStatus = (): GameStatusActions => {
  const determineGameStatus = useCallback(
    (board: ChessBoardType, player: PieceColor, enPassantTarget: Position | null, castlingRights: CastlingRights): GameStatus => {
      const playerInCheck = isInCheck(board, player)
      const playerCheckmate = isCheckmate(board, player, enPassantTarget, castlingRights)
      const playerStalemate = isStalemate(board, player, enPassantTarget, castlingRights)

      if (playerCheckmate) {
        return GAME_STATUS.CHECKMATE
      }

      if (playerStalemate) {
        return GAME_STATUS.STALEMATE
      }

      if (playerInCheck) {
        return GAME_STATUS.CHECK
      }

      return GAME_STATUS.PLAYING
    },
    []
  )

  const checkForGameEnd = useCallback(
    (board: ChessBoardType, player: PieceColor, enPassantTarget: Position | null, castlingRights: CastlingRights) => {
      const status = determineGameStatus(board, player, enPassantTarget, castlingRights)
      const isGameOver = status === GAME_STATUS.CHECKMATE || status === GAME_STATUS.STALEMATE
      const winner = status === GAME_STATUS.CHECKMATE ? (player === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE) : null

      return { status, isGameOver, winner }
    },
    [determineGameStatus]
  )

  return {
    determineGameStatus,
    checkForGameEnd
  }
}
