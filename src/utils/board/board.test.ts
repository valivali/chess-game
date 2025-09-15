import { describe, expect, it } from "@jest/globals"

import type { ChessBoard } from "../../components/ChessBoard/chessBoard.types"
import { PIECE_COLOR, PIECE_TYPE } from "../../components/ChessBoard/chessBoard.types"
import { findKingPosition } from "../moves/moves"
import { createInitialBoard } from "./board"

describe("Board Utilities", () => {
  describe("createInitialBoard", () => {
    it("should create a standard chess board with correct piece placement", () => {
      const board = createInitialBoard()

      expect(board).toHaveLength(8)
      expect(board[0]).toHaveLength(8)

      expect(board[0][0]).toEqual({ type: PIECE_TYPE.ROOK, color: PIECE_COLOR.BLACK, weight: 5 })
      expect(board[0][1]).toEqual({ type: PIECE_TYPE.KNIGHT, color: PIECE_COLOR.BLACK, weight: 3 })
      expect(board[0][2]).toEqual({ type: PIECE_TYPE.BISHOP, color: PIECE_COLOR.BLACK, weight: 3 })
      expect(board[0][3]).toEqual({ type: PIECE_TYPE.QUEEN, color: PIECE_COLOR.BLACK, weight: 9 })
      expect(board[0][4]).toEqual({ type: PIECE_TYPE.KING, color: PIECE_COLOR.BLACK, weight: 0 })
      expect(board[0][5]).toEqual({ type: PIECE_TYPE.BISHOP, color: PIECE_COLOR.BLACK, weight: 3 })
      expect(board[0][6]).toEqual({ type: PIECE_TYPE.KNIGHT, color: PIECE_COLOR.BLACK, weight: 3 })
      expect(board[0][7]).toEqual({ type: PIECE_TYPE.ROOK, color: PIECE_COLOR.BLACK, weight: 5 })

      for (let i = 0; i < 8; i++) {
        expect(board[1][i]).toEqual({ type: PIECE_TYPE.PAWN, color: PIECE_COLOR.BLACK, weight: 1 })
      }

      for (let row = 2; row < 6; row++) {
        for (let col = 0; col < 8; col++) {
          expect(board[row][col]).toBeNull()
        }
      }

      for (let i = 0; i < 8; i++) {
        expect(board[6][i]).toEqual({ type: PIECE_TYPE.PAWN, color: PIECE_COLOR.WHITE, weight: 1 })
      }

      expect(board[7][0]).toEqual({ type: PIECE_TYPE.ROOK, color: PIECE_COLOR.WHITE, weight: 5 })
      expect(board[7][1]).toEqual({ type: PIECE_TYPE.KNIGHT, color: PIECE_COLOR.WHITE, weight: 3 })
      expect(board[7][2]).toEqual({ type: PIECE_TYPE.BISHOP, color: PIECE_COLOR.WHITE, weight: 3 })
      expect(board[7][3]).toEqual({ type: PIECE_TYPE.QUEEN, color: PIECE_COLOR.WHITE, weight: 9 })
      expect(board[7][4]).toEqual({ type: PIECE_TYPE.KING, color: PIECE_COLOR.WHITE, weight: 0 })
      expect(board[7][5]).toEqual({ type: PIECE_TYPE.BISHOP, color: PIECE_COLOR.WHITE, weight: 3 })
      expect(board[7][6]).toEqual({ type: PIECE_TYPE.KNIGHT, color: PIECE_COLOR.WHITE, weight: 3 })
      expect(board[7][7]).toEqual({ type: PIECE_TYPE.ROOK, color: PIECE_COLOR.WHITE, weight: 5 })
    })
  })

  describe("findKingPosition", () => {
    it("should find the white king position on initial board", () => {
      const board = createInitialBoard()
      const kingPos = findKingPosition(board, PIECE_COLOR.WHITE)

      expect(kingPos).toEqual({ x: 7, y: 4 })
    })

    it("should find the black king position on initial board", () => {
      const board = createInitialBoard()
      const kingPos = findKingPosition(board, PIECE_COLOR.BLACK)

      expect(kingPos).toEqual({ x: 0, y: 4 })
    })

    it("should return null if king is not found", () => {
      const emptyBoard: ChessBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null))
      const kingPos = findKingPosition(emptyBoard, PIECE_COLOR.WHITE)

      expect(kingPos).toBeNull()
    })
  })
})
