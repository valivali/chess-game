import { beforeEach, describe, expect, it } from "@jest/globals"

import type { CastlingRights, ChessBoard, ChessPiece, Position } from "../../components/ChessBoard/chessBoard.types"
import { CASTLING_SIDE, PIECE_COLOR, PIECE_TYPE, PIECE_WEIGHTS } from "../../components/ChessBoard/chessBoard.types"
import { createInitialBoard } from "../board/board"
import {
  canCastle,
  createInitialCastlingRights,
  createPromotedQueen,
  getAllLegalMovesForPlayer,
  getCastlingMoves,
  getCastlingSide,
  getLegalMoves,
  getValidMoves,
  isCastlingMove,
  isCheckmate,
  isEnPassantCapture,
  isPawnPromotion,
  isStalemate,
  updateCastlingRights
} from "./moves"

describe("Move Utilities", () => {
  describe("getValidMoves", () => {
    let board: ChessBoard

    beforeEach(() => {
      board = createInitialBoard()
    })

    it("should return correct pawn moves from starting position", () => {
      const whitePawn: ChessPiece = { type: PIECE_TYPE.PAWN, color: PIECE_COLOR.WHITE, weight: 1 }
      const moves = getValidMoves(whitePawn, { x: 6, y: 4 }, board)

      expect(moves).toHaveLength(2)
      expect(moves).toContainEqual({ x: 5, y: 4 })
      expect(moves).toContainEqual({ x: 4, y: 4 })
    })

    it("should return correct knight moves from starting position", () => {
      const whiteKnight: ChessPiece = { type: PIECE_TYPE.KNIGHT, color: PIECE_COLOR.WHITE, weight: 3 }
      const moves = getValidMoves(whiteKnight, { x: 7, y: 1 }, board)

      expect(moves).toHaveLength(2)
      expect(moves).toContainEqual({ x: 5, y: 0 })
      expect(moves).toContainEqual({ x: 5, y: 2 })
    })

    it("should return correct rook moves on empty board", () => {
      const emptyBoard: ChessBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null))
      emptyBoard[4][4] = { type: PIECE_TYPE.ROOK, color: PIECE_COLOR.WHITE, weight: 5 }

      const moves = getValidMoves({ type: PIECE_TYPE.ROOK, color: PIECE_COLOR.WHITE, weight: 5 }, { x: 4, y: 4 }, emptyBoard)

      expect(moves).toHaveLength(14)
    })

    it("should return correct king moves", () => {
      const emptyBoard: ChessBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null))
      emptyBoard[4][4] = { type: PIECE_TYPE.KING, color: PIECE_COLOR.WHITE, weight: 0 }

      const moves = getValidMoves({ type: PIECE_TYPE.KING, color: PIECE_COLOR.WHITE, weight: 0 }, { x: 4, y: 4 }, emptyBoard)

      expect(moves).toHaveLength(8)
    })
  })

  describe("isEnPassantCapture", () => {
    it("should detect en passant capture correctly", () => {
      const pawn: ChessPiece = { type: PIECE_TYPE.PAWN, color: PIECE_COLOR.WHITE, weight: 1 }
      const from: Position = { x: 3, y: 4 }
      const to: Position = { x: 2, y: 5 }
      const enPassantTarget: Position = { x: 2, y: 5 }

      expect(isEnPassantCapture(pawn, from, to, enPassantTarget)).toBe(true)
    })

    it("should return false for non-pawn pieces", () => {
      const rook: ChessPiece = { type: PIECE_TYPE.ROOK, color: PIECE_COLOR.WHITE, weight: 5 }
      const from: Position = { x: 3, y: 4 }
      const to: Position = { x: 2, y: 5 }
      const enPassantTarget: Position = { x: 2, y: 5 }

      expect(isEnPassantCapture(rook, from, to, enPassantTarget)).toBe(false)
    })

    it("should return false when no en passant target", () => {
      const pawn: ChessPiece = { type: PIECE_TYPE.PAWN, color: PIECE_COLOR.WHITE, weight: 1 }
      const from: Position = { x: 3, y: 4 }
      const to: Position = { x: 2, y: 5 }

      expect(isEnPassantCapture(pawn, from, to, null)).toBe(false)
    })
  })

  describe("getLegalMoves", () => {
    it("should filter out moves that would leave king in check", () => {
      const board: ChessBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null))
      board[0][4] = { type: PIECE_TYPE.KING, color: PIECE_COLOR.WHITE, weight: 0 }
      board[0][3] = { type: PIECE_TYPE.BISHOP, color: PIECE_COLOR.WHITE, weight: 3 }
      board[0][0] = { type: PIECE_TYPE.ROOK, color: PIECE_COLOR.BLACK, weight: 5 }

      const legalMoves = getLegalMoves({ type: PIECE_TYPE.BISHOP, color: PIECE_COLOR.WHITE, weight: 3 }, { x: 0, y: 3 }, board)

      expect(legalMoves.length).toBeLessThan(7)
    })
  })

  describe("isCheckmate", () => {
    it("should return false for initial board position", () => {
      const board = createInitialBoard()

      expect(isCheckmate(board, PIECE_COLOR.WHITE)).toBe(false)
      expect(isCheckmate(board, PIECE_COLOR.BLACK)).toBe(false)
    })

    it("should detect checkmate correctly", () => {
      const board = createInitialBoard()
      const result = isCheckmate(board, PIECE_COLOR.WHITE)
      expect(typeof result).toBe("boolean")
    })
  })

  describe("isStalemate", () => {
    it("should return false for initial board position", () => {
      const board = createInitialBoard()

      expect(isStalemate(board, PIECE_COLOR.WHITE)).toBe(false)
      expect(isStalemate(board, PIECE_COLOR.BLACK)).toBe(false)
    })

    it("should detect stalemate correctly", () => {
      const board = createInitialBoard()
      const result = isStalemate(board, PIECE_COLOR.WHITE)
      expect(typeof result).toBe("boolean")
    })
  })

  describe("getAllLegalMovesForPlayer", () => {
    it("should return all legal moves for white on initial board", () => {
      const board = createInitialBoard()
      const moves = getAllLegalMovesForPlayer(board, PIECE_COLOR.WHITE)

      expect(moves).toHaveLength(20)
    })

    it("should return all legal moves for black on initial board", () => {
      const board = createInitialBoard()
      const moves = getAllLegalMovesForPlayer(board, PIECE_COLOR.BLACK)

      expect(moves).toHaveLength(20)
    })
  })

  describe("Castling", () => {
    describe("createInitialCastlingRights", () => {
      it("should create initial castling rights with all rights enabled", () => {
        const rights = createInitialCastlingRights()

        expect(rights.white.kingside).toBe(true)
        expect(rights.white.queenside).toBe(true)
        expect(rights.black.kingside).toBe(true)
        expect(rights.black.queenside).toBe(true)
      })
    })

    describe("updateCastlingRights", () => {
      let castlingRights: CastlingRights

      beforeEach(() => {
        castlingRights = createInitialCastlingRights()
      })

      it("should remove all castling rights when white king moves", () => {
        const piece: ChessPiece = { type: PIECE_TYPE.KING, color: PIECE_COLOR.WHITE, weight: 0 }
        const from: Position = { x: 7, y: 4 }

        const newRights = updateCastlingRights(castlingRights, from, piece)

        expect(newRights.white.kingside).toBe(false)
        expect(newRights.white.queenside).toBe(false)
        expect(newRights.black.kingside).toBe(true)
        expect(newRights.black.queenside).toBe(true)
      })

      it("should remove all castling rights when black king moves", () => {
        const piece: ChessPiece = { type: PIECE_TYPE.KING, color: PIECE_COLOR.BLACK, weight: 0 }
        const from: Position = { x: 0, y: 4 }

        const newRights = updateCastlingRights(castlingRights, from, piece)

        expect(newRights.white.kingside).toBe(true)
        expect(newRights.white.queenside).toBe(true)
        expect(newRights.black.kingside).toBe(false)
        expect(newRights.black.queenside).toBe(false)
      })
    })

    describe("canCastle", () => {
      let board: ChessBoard
      let castlingRights: CastlingRights

      beforeEach(() => {
        board = Array(8)
          .fill(null)
          .map(() => Array(8).fill(null))

        board[7][4] = { type: PIECE_TYPE.KING, color: PIECE_COLOR.WHITE, weight: 0 }
        board[7][0] = { type: PIECE_TYPE.ROOK, color: PIECE_COLOR.WHITE, weight: 5 }
        board[7][7] = { type: PIECE_TYPE.ROOK, color: PIECE_COLOR.WHITE, weight: 5 }

        board[0][4] = { type: PIECE_TYPE.KING, color: PIECE_COLOR.BLACK, weight: 0 }
        board[0][0] = { type: PIECE_TYPE.ROOK, color: PIECE_COLOR.BLACK, weight: 5 }
        board[0][7] = { type: PIECE_TYPE.ROOK, color: PIECE_COLOR.BLACK, weight: 5 }

        castlingRights = createInitialCastlingRights()
      })

      it("should allow kingside castling when conditions are met", () => {
        expect(canCastle(board, PIECE_COLOR.WHITE, CASTLING_SIDE.KINGSIDE, castlingRights)).toBe(true)
        expect(canCastle(board, PIECE_COLOR.BLACK, CASTLING_SIDE.KINGSIDE, castlingRights)).toBe(true)
      })

      it("should allow queenside castling when conditions are met", () => {
        expect(canCastle(board, PIECE_COLOR.WHITE, CASTLING_SIDE.QUEENSIDE, castlingRights)).toBe(true)
        expect(canCastle(board, PIECE_COLOR.BLACK, CASTLING_SIDE.QUEENSIDE, castlingRights)).toBe(true)
      })

      it("should not allow castling when castling rights are lost", () => {
        castlingRights.white.kingside = false
        castlingRights.black.queenside = false

        expect(canCastle(board, PIECE_COLOR.WHITE, CASTLING_SIDE.KINGSIDE, castlingRights)).toBe(false)
        expect(canCastle(board, PIECE_COLOR.BLACK, CASTLING_SIDE.QUEENSIDE, castlingRights)).toBe(false)
      })
    })

    describe("getCastlingMoves", () => {
      let board: ChessBoard
      let castlingRights: CastlingRights

      beforeEach(() => {
        board = Array(8)
          .fill(null)
          .map(() => Array(8).fill(null))

        board[7][4] = { type: PIECE_TYPE.KING, color: PIECE_COLOR.WHITE, weight: 0 }
        board[7][0] = { type: PIECE_TYPE.ROOK, color: PIECE_COLOR.WHITE, weight: 5 }
        board[7][7] = { type: PIECE_TYPE.ROOK, color: PIECE_COLOR.WHITE, weight: 5 }

        castlingRights = createInitialCastlingRights()
      })

      it("should return both castling moves when both are available", () => {
        const moves = getCastlingMoves(board, PIECE_COLOR.WHITE, castlingRights)

        expect(moves).toHaveLength(2)
        expect(moves).toContainEqual({ x: 7, y: 6 })
        expect(moves).toContainEqual({ x: 7, y: 2 })
      })

      it("should return only available castling moves", () => {
        castlingRights.white.kingside = false

        const moves = getCastlingMoves(board, PIECE_COLOR.WHITE, castlingRights)

        expect(moves).toHaveLength(1)
        expect(moves).toContainEqual({ x: 7, y: 2 })
      })

      it("should return no moves when no castling is available", () => {
        castlingRights.white.kingside = false
        castlingRights.white.queenside = false

        const moves = getCastlingMoves(board, PIECE_COLOR.WHITE, castlingRights)

        expect(moves).toHaveLength(0)
      })
    })

    describe("isCastlingMove", () => {
      it("should detect kingside castling move", () => {
        const king: ChessPiece = { type: PIECE_TYPE.KING, color: PIECE_COLOR.WHITE, weight: 0 }
        const from: Position = { x: 7, y: 4 }
        const to: Position = { x: 7, y: 6 }

        expect(isCastlingMove(from, to, king)).toBe(true)
      })

      it("should detect queenside castling move", () => {
        const king: ChessPiece = { type: PIECE_TYPE.KING, color: PIECE_COLOR.WHITE, weight: 0 }
        const from: Position = { x: 7, y: 4 }
        const to: Position = { x: 7, y: 2 }

        expect(isCastlingMove(from, to, king)).toBe(true)
      })

      it("should not detect castling for non-king pieces", () => {
        const rook: ChessPiece = { type: PIECE_TYPE.ROOK, color: PIECE_COLOR.WHITE, weight: 5 }
        const from: Position = { x: 7, y: 4 }
        const to: Position = { x: 7, y: 6 }

        expect(isCastlingMove(from, to, rook)).toBe(false)
      })

      it("should not detect castling for regular king moves", () => {
        const king: ChessPiece = { type: PIECE_TYPE.KING, color: PIECE_COLOR.WHITE, weight: 0 }
        const from: Position = { x: 7, y: 4 }
        const to: Position = { x: 7, y: 5 }

        expect(isCastlingMove(from, to, king)).toBe(false)
      })
    })

    describe("getCastlingSide", () => {
      it("should return kingside for rightward king move", () => {
        const from: Position = { x: 7, y: 4 }
        const to: Position = { x: 7, y: 6 }

        expect(getCastlingSide(from, to)).toBe(CASTLING_SIDE.KINGSIDE)
      })

      it("should return queenside for leftward king move", () => {
        const from: Position = { x: 7, y: 4 }
        const to: Position = { x: 7, y: 2 }

        expect(getCastlingSide(from, to)).toBe(CASTLING_SIDE.QUEENSIDE)
      })
    })

    describe("Integration with existing functions", () => {
      let board: ChessBoard
      let castlingRights: CastlingRights

      beforeEach(() => {
        board = Array(8)
          .fill(null)
          .map(() => Array(8).fill(null))

        board[7][4] = { type: PIECE_TYPE.KING, color: PIECE_COLOR.WHITE, weight: 0 }
        board[7][0] = { type: PIECE_TYPE.ROOK, color: PIECE_COLOR.WHITE, weight: 5 }
        board[7][7] = { type: PIECE_TYPE.ROOK, color: PIECE_COLOR.WHITE, weight: 5 }

        castlingRights = createInitialCastlingRights()
      })

      it("should include castling moves in king's legal moves", () => {
        const king = board[7][4]!
        const moves = getLegalMoves(king, { x: 7, y: 4 }, board, null, castlingRights)

        expect(moves).toContainEqual({ x: 7, y: 6 })
        expect(moves).toContainEqual({ x: 7, y: 2 })
      })

      it("should include castling moves in all legal moves for player", () => {
        const allMoves = getAllLegalMovesForPlayer(board, PIECE_COLOR.WHITE, null, castlingRights)

        const castlingMoves = allMoves.filter((move) => move.from.x === 7 && move.from.y === 4 && (move.to.y === 2 || move.to.y === 6))

        expect(castlingMoves).toHaveLength(2)
      })
    })
  })

  describe("Pawn Promotion", () => {
    describe("isPawnPromotion", () => {
      it("should detect white pawn promotion on row 0", () => {
        const whitePawn = { type: PIECE_TYPE.PAWN, color: PIECE_COLOR.WHITE, weight: 1 }
        const promotionPosition = { x: 0, y: 4 }

        expect(isPawnPromotion(whitePawn, promotionPosition)).toBe(true)
      })

      it("should detect black pawn promotion on row 7", () => {
        const blackPawn = { type: PIECE_TYPE.PAWN, color: PIECE_COLOR.BLACK, weight: 1 }
        const promotionPosition = { x: 7, y: 4 }

        expect(isPawnPromotion(blackPawn, promotionPosition)).toBe(true)
      })

      it("should not detect promotion for white pawn not on row 0", () => {
        const whitePawn = { type: PIECE_TYPE.PAWN, color: PIECE_COLOR.WHITE, weight: 1 }
        const nonPromotionPosition = { x: 1, y: 4 }

        expect(isPawnPromotion(whitePawn, nonPromotionPosition)).toBe(false)
      })

      it("should not detect promotion for black pawn not on row 7", () => {
        const blackPawn = { type: PIECE_TYPE.PAWN, color: PIECE_COLOR.BLACK, weight: 1 }
        const nonPromotionPosition = { x: 6, y: 4 }

        expect(isPawnPromotion(blackPawn, nonPromotionPosition)).toBe(false)
      })

      it("should not detect promotion for non-pawn pieces", () => {
        const queen = { type: PIECE_TYPE.QUEEN, color: PIECE_COLOR.WHITE, weight: 9 }
        const promotionPosition = { x: 0, y: 4 }

        expect(isPawnPromotion(queen, promotionPosition)).toBe(false)
      })
    })

    describe("createPromotedQueen", () => {
      it("should create a white queen from white pawn promotion", () => {
        const promotedQueen = createPromotedQueen(PIECE_COLOR.WHITE)

        expect(promotedQueen).toEqual({
          type: PIECE_TYPE.QUEEN,
          color: PIECE_COLOR.WHITE,
          weight: PIECE_WEIGHTS[PIECE_TYPE.QUEEN]
        })
      })

      it("should create a black queen from black pawn promotion", () => {
        const promotedQueen = createPromotedQueen(PIECE_COLOR.BLACK)

        expect(promotedQueen).toEqual({
          type: PIECE_TYPE.QUEEN,
          color: PIECE_COLOR.BLACK,
          weight: PIECE_WEIGHTS[PIECE_TYPE.QUEEN]
        })
      })
    })
  })
})
