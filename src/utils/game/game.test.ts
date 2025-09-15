import { describe, expect, it } from "@jest/globals"

import type { ChessPiece } from "../../components/ChessBoard/chessBoard.types"
import { GAME_STATUS, PIECE_COLOR, PIECE_TYPE } from "../../components/ChessBoard/chessBoard.types"
import {
  calculateScoreAdvantages,
  getCurrentPlayerDisplayText,
  getGameStatusClassName,
  getGameStatusMessage,
  getWinnerDisplayText,
  isGameOver
} from "./game"

describe("Game Utilities", () => {
  describe("calculateScoreAdvantages", () => {
    it("should calculate white advantage correctly", () => {
      const whiteCapturedPieces: ChessPiece[] = [
        { type: PIECE_TYPE.QUEEN, color: PIECE_COLOR.BLACK, weight: 9 },
        { type: PIECE_TYPE.PAWN, color: PIECE_COLOR.BLACK, weight: 1 }
      ]
      const blackCapturedPieces: ChessPiece[] = [{ type: PIECE_TYPE.ROOK, color: PIECE_COLOR.WHITE, weight: 5 }]

      const result = calculateScoreAdvantages(whiteCapturedPieces, blackCapturedPieces)

      expect(result.whiteAdvantage).toBe(5) // 10 - 5 = 5
      expect(result.blackAdvantage).toBeUndefined()
    })

    it("should calculate black advantage correctly", () => {
      const whiteCapturedPieces: ChessPiece[] = [{ type: PIECE_TYPE.PAWN, color: PIECE_COLOR.BLACK, weight: 1 }]
      const blackCapturedPieces: ChessPiece[] = [{ type: PIECE_TYPE.QUEEN, color: PIECE_COLOR.WHITE, weight: 9 }]

      const result = calculateScoreAdvantages(whiteCapturedPieces, blackCapturedPieces)

      expect(result.blackAdvantage).toBe(8) // 9 - 1 = 8
      expect(result.whiteAdvantage).toBeUndefined()
    })

    it("should return no advantage when scores are equal", () => {
      const whiteCapturedPieces: ChessPiece[] = [{ type: PIECE_TYPE.ROOK, color: PIECE_COLOR.BLACK, weight: 5 }]
      const blackCapturedPieces: ChessPiece[] = [{ type: PIECE_TYPE.ROOK, color: PIECE_COLOR.WHITE, weight: 5 }]

      const result = calculateScoreAdvantages(whiteCapturedPieces, blackCapturedPieces)

      expect(result.whiteAdvantage).toBeUndefined()
      expect(result.blackAdvantage).toBeUndefined()
    })
  })

  describe("getGameStatusClassName", () => {
    it("should return correct CSS class names for game statuses", () => {
      expect(getGameStatusClassName(GAME_STATUS.PLAYING)).toBe("chess-board-game-status chess-board-game-status--playing")
      expect(getGameStatusClassName(GAME_STATUS.CHECK)).toBe("chess-board-game-status chess-board-game-status--check")
      expect(getGameStatusClassName(GAME_STATUS.CHECKMATE)).toBe("chess-board-game-status chess-board-game-status--checkmate")
      expect(getGameStatusClassName(GAME_STATUS.STALEMATE)).toBe("chess-board-game-status chess-board-game-status--stalemate")
    })
  })

  describe("getCurrentPlayerDisplayText", () => {
    it("should return correct display text for current player", () => {
      expect(getCurrentPlayerDisplayText(PIECE_COLOR.WHITE)).toBe("White")
      expect(getCurrentPlayerDisplayText(PIECE_COLOR.BLACK)).toBe("Black")
    })
  })

  describe("getWinnerDisplayText", () => {
    it("should return correct winner text (opposite of current player)", () => {
      expect(getWinnerDisplayText(PIECE_COLOR.WHITE)).toBe("Black")
      expect(getWinnerDisplayText(PIECE_COLOR.BLACK)).toBe("White")
    })
  })

  describe("isGameOver", () => {
    it("should return true for game over statuses", () => {
      expect(isGameOver(GAME_STATUS.CHECKMATE)).toBe(true)
      expect(isGameOver(GAME_STATUS.STALEMATE)).toBe(true)
    })

    it("should return false for ongoing game statuses", () => {
      expect(isGameOver(GAME_STATUS.PLAYING)).toBe(false)
      expect(isGameOver(GAME_STATUS.CHECK)).toBe(false)
    })
  })

  describe("getGameStatusMessage", () => {
    it("should return correct message for checkmate", () => {
      expect(getGameStatusMessage(GAME_STATUS.CHECKMATE, PIECE_COLOR.WHITE)).toBe("Checkmate! Black wins!")
      expect(getGameStatusMessage(GAME_STATUS.CHECKMATE, PIECE_COLOR.BLACK)).toBe("Checkmate! White wins!")
    })

    it("should return correct message for stalemate", () => {
      expect(getGameStatusMessage(GAME_STATUS.STALEMATE, PIECE_COLOR.WHITE)).toBe("Stalemate! The game is a draw.")
      expect(getGameStatusMessage(GAME_STATUS.STALEMATE, PIECE_COLOR.BLACK)).toBe("Stalemate! The game is a draw.")
    })

    it("should return correct message for check", () => {
      expect(getGameStatusMessage(GAME_STATUS.CHECK, PIECE_COLOR.WHITE)).toBe("White is in check!")
      expect(getGameStatusMessage(GAME_STATUS.CHECK, PIECE_COLOR.BLACK)).toBe("Black is in check!")
    })

    it("should return empty string for playing status", () => {
      expect(getGameStatusMessage(GAME_STATUS.PLAYING, PIECE_COLOR.WHITE)).toBe("")
      expect(getGameStatusMessage(GAME_STATUS.PLAYING, PIECE_COLOR.BLACK)).toBe("")
    })
  })
})
