import { describe, expect, it } from "@jest/globals"

import type { ChessBoard } from "../../components/ChessBoard/ChessBoard.types"
import { PIECE_COLOR, PIECE_TYPE } from "../../components/ChessBoard/ChessBoard.types"
import { findKingPosition } from "../moves/moves"
import { createInitialBoard } from "./board"

describe("Board Utilities", () => {
  describe("createInitialBoard", () => {
    it("should create a standard chess board with correct piece placement", () => {
      const board = createInitialBoard()

      expect(board).toHaveLength(8)
      expect(board[0]).toHaveLength(8)

      expect(board[0][0]?.type).toBe(PIECE_TYPE.ROOK)
      expect(board[0][0]?.color).toBe(PIECE_COLOR.BLACK)
      expect(board[0][1]?.type).toBe(PIECE_TYPE.KNIGHT)
      expect(board[0][1]?.color).toBe(PIECE_COLOR.BLACK)
      expect(board[0][2]?.type).toBe(PIECE_TYPE.BISHOP)
      expect(board[0][2]?.color).toBe(PIECE_COLOR.BLACK)
      expect(board[0][3]?.type).toBe(PIECE_TYPE.QUEEN)
      expect(board[0][3]?.color).toBe(PIECE_COLOR.BLACK)
      expect(board[0][4]?.type).toBe(PIECE_TYPE.KING)
      expect(board[0][4]?.color).toBe(PIECE_COLOR.BLACK)
      expect(board[0][5]?.type).toBe(PIECE_TYPE.BISHOP)
      expect(board[0][5]?.color).toBe(PIECE_COLOR.BLACK)
      expect(board[0][6]?.type).toBe(PIECE_TYPE.KNIGHT)
      expect(board[0][6]?.color).toBe(PIECE_COLOR.BLACK)
      expect(board[0][7]?.type).toBe(PIECE_TYPE.ROOK)
      expect(board[0][7]?.color).toBe(PIECE_COLOR.BLACK)

      for (let i = 0; i < 8; i++) {
        expect(board[1][i]?.type).toBe(PIECE_TYPE.PAWN)
        expect(board[1][i]?.color).toBe(PIECE_COLOR.BLACK)
      }

      for (let row = 2; row < 6; row++) {
        for (let col = 0; col < 8; col++) {
          expect(board[row][col]).toBeNull()
        }
      }

      for (let i = 0; i < 8; i++) {
        expect(board[6][i]?.type).toBe(PIECE_TYPE.PAWN)
        expect(board[6][i]?.color).toBe(PIECE_COLOR.WHITE)
      }

      expect(board[7][0]?.type).toBe(PIECE_TYPE.ROOK)
      expect(board[7][0]?.color).toBe(PIECE_COLOR.WHITE)
      expect(board[7][1]?.type).toBe(PIECE_TYPE.KNIGHT)
      expect(board[7][1]?.color).toBe(PIECE_COLOR.WHITE)
      expect(board[7][2]?.type).toBe(PIECE_TYPE.BISHOP)
      expect(board[7][2]?.color).toBe(PIECE_COLOR.WHITE)
      expect(board[7][3]?.type).toBe(PIECE_TYPE.QUEEN)
      expect(board[7][3]?.color).toBe(PIECE_COLOR.WHITE)
      expect(board[7][4]?.type).toBe(PIECE_TYPE.KING)
      expect(board[7][4]?.color).toBe(PIECE_COLOR.WHITE)
      expect(board[7][5]?.type).toBe(PIECE_TYPE.BISHOP)
      expect(board[7][5]?.color).toBe(PIECE_COLOR.WHITE)
      expect(board[7][6]?.type).toBe(PIECE_TYPE.KNIGHT)
      expect(board[7][6]?.color).toBe(PIECE_COLOR.WHITE)
      expect(board[7][7]?.type).toBe(PIECE_TYPE.ROOK)
      expect(board[7][7]?.color).toBe(PIECE_COLOR.WHITE)
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
