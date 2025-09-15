import type { ChessPiece, GameStatus, PieceColor } from "../../components/ChessBoard/chessBoard.types"
import { GAME_STATUS, PIECE_COLOR } from "../../components/ChessBoard/chessBoard.types"

export interface ScoreAdvantages {
  whiteAdvantage?: number
  blackAdvantage?: number
}

export const calculateScoreAdvantages = (whiteCapturedPieces: ChessPiece[], blackCapturedPieces: ChessPiece[]): ScoreAdvantages => {
  const whiteScore = whiteCapturedPieces.reduce((sum, piece) => sum + piece.weight, 0)
  const blackScore = blackCapturedPieces.reduce((sum, piece) => sum + piece.weight, 0)
  const whiteDifference = whiteScore - blackScore
  const blackDifference = blackScore - whiteScore

  return {
    whiteAdvantage: whiteDifference > 0 ? whiteDifference : undefined,
    blackAdvantage: blackDifference > 0 ? blackDifference : undefined
  }
}

export const getGameStatusClassName = (status: GameStatus): string => {
  return `chess-board-game-status chess-board-game-status--${status}`
}

export const getCurrentPlayerDisplayText = (currentPlayer: PieceColor): string => {
  return currentPlayer === PIECE_COLOR.WHITE ? "White" : "Black"
}

export const getWinnerDisplayText = (currentPlayer: PieceColor): string => {
  return currentPlayer === PIECE_COLOR.WHITE ? "Black" : "White"
}

export const isGameOver = (gameStatus: GameStatus): boolean => {
  return gameStatus === GAME_STATUS.CHECKMATE || gameStatus === GAME_STATUS.STALEMATE
}

export const getGameStatusMessage = (gameStatus: GameStatus, currentPlayer: PieceColor): string => {
  switch (gameStatus) {
    case GAME_STATUS.CHECKMATE:
      return `Checkmate! ${getWinnerDisplayText(currentPlayer)} wins!`
    case GAME_STATUS.STALEMATE:
      return "Stalemate! The game is a draw."
    case GAME_STATUS.CHECK:
      return `${getCurrentPlayerDisplayText(currentPlayer)} is in check!`
    default:
      return ""
  }
}
