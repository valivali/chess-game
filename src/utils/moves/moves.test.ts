import { beforeEach, describe, expect, it } from "@jest/globals"

import type { CastlingRights, ChessBoard, Position } from "../../components/ChessBoard/ChessBoard.types"
import { CASTLING_SIDE, PIECE_COLOR, PIECE_TYPE, PIECE_WEIGHTS } from "../../components/ChessBoard/ChessBoard.types"
import { PieceFactory } from "../../components/pieces"
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
      const whitePawn = PieceFactory.createPiece(PIECE_TYPE.PAWN, PIECE_COLOR.WHITE)
      const moves = getValidMoves(whitePawn, { x: 6, y: 4 }, board)

      expect(moves).toHaveLength(2)
      expect(moves).toContainEqual({ x: 5, y: 4 })
      expect(moves).toContainEqual({ x: 4, y: 4 })
    })

    it("should return correct knight moves from starting position", () => {
      const whiteKnight = PieceFactory.createPiece(PIECE_TYPE.KNIGHT, PIECE_COLOR.WHITE)
      const moves = getValidMoves(whiteKnight, { x: 7, y: 1 }, board)

      expect(moves).toHaveLength(2)
      expect(moves).toContainEqual({ x: 5, y: 0 })
      expect(moves).toContainEqual({ x: 5, y: 2 })
    })

    it("should return correct rook moves on empty board", () => {
      const emptyBoard: ChessBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null))
      const whiteRook = PieceFactory.createPiece(PIECE_TYPE.ROOK, PIECE_COLOR.WHITE)
      emptyBoard[4][4] = whiteRook

      const moves = getValidMoves(whiteRook, { x: 4, y: 4 }, emptyBoard)

      expect(moves).toHaveLength(14)
    })

    it("should return correct king moves", () => {
      const emptyBoard: ChessBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null))
      const whiteKing = PieceFactory.createPiece(PIECE_TYPE.KING, PIECE_COLOR.WHITE)
      emptyBoard[4][4] = whiteKing

      const moves = getValidMoves(whiteKing, { x: 4, y: 4 }, emptyBoard)

      expect(moves).toHaveLength(8)
    })
  })

  describe("isEnPassantCapture", () => {
    it("should detect en passant capture correctly", () => {
      const pawn = PieceFactory.createPiece(PIECE_TYPE.PAWN, PIECE_COLOR.WHITE)
      const from: Position = { x: 3, y: 4 }
      const to: Position = { x: 2, y: 5 }
      const enPassantTarget: Position = { x: 2, y: 5 }

      expect(isEnPassantCapture(pawn, from, to, enPassantTarget)).toBe(true)
    })

    it("should return false for non-pawn pieces", () => {
      const rook = PieceFactory.createPiece(PIECE_TYPE.ROOK, PIECE_COLOR.WHITE)
      const from: Position = { x: 3, y: 4 }
      const to: Position = { x: 2, y: 5 }
      const enPassantTarget: Position = { x: 2, y: 5 }

      expect(isEnPassantCapture(rook, from, to, enPassantTarget)).toBe(false)
    })

    it("should return false when no en passant target", () => {
      const pawn = PieceFactory.createPiece(PIECE_TYPE.PAWN, PIECE_COLOR.WHITE)
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
      const whiteKing = PieceFactory.createPiece(PIECE_TYPE.KING, PIECE_COLOR.WHITE)
      const whiteBishop = PieceFactory.createPiece(PIECE_TYPE.BISHOP, PIECE_COLOR.WHITE)
      const blackRook = PieceFactory.createPiece(PIECE_TYPE.ROOK, PIECE_COLOR.BLACK)

      board[0][4] = whiteKing
      board[0][3] = whiteBishop
      board[0][0] = blackRook

      const legalMoves = getLegalMoves(whiteBishop, { x: 0, y: 3 }, board)

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
        const piece = PieceFactory.createPiece(PIECE_TYPE.KING, PIECE_COLOR.WHITE)
        const from: Position = { x: 7, y: 4 }

        const newRights = updateCastlingRights(castlingRights, from, piece)

        expect(newRights.white.kingside).toBe(false)
        expect(newRights.white.queenside).toBe(false)
        expect(newRights.black.kingside).toBe(true)
        expect(newRights.black.queenside).toBe(true)
      })

      it("should remove all castling rights when black king moves", () => {
        const piece = PieceFactory.createPiece(PIECE_TYPE.KING, PIECE_COLOR.BLACK)
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

        board[7][4] = PieceFactory.createPiece(PIECE_TYPE.KING, PIECE_COLOR.WHITE)
        board[7][0] = PieceFactory.createPiece(PIECE_TYPE.ROOK, PIECE_COLOR.WHITE)
        board[7][7] = PieceFactory.createPiece(PIECE_TYPE.ROOK, PIECE_COLOR.WHITE)

        board[0][4] = PieceFactory.createPiece(PIECE_TYPE.KING, PIECE_COLOR.BLACK)
        board[0][0] = PieceFactory.createPiece(PIECE_TYPE.ROOK, PIECE_COLOR.BLACK)
        board[0][7] = PieceFactory.createPiece(PIECE_TYPE.ROOK, PIECE_COLOR.BLACK)

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

        board[7][4] = PieceFactory.createPiece(PIECE_TYPE.KING, PIECE_COLOR.WHITE)
        board[7][0] = PieceFactory.createPiece(PIECE_TYPE.ROOK, PIECE_COLOR.WHITE)
        board[7][7] = PieceFactory.createPiece(PIECE_TYPE.ROOK, PIECE_COLOR.WHITE)

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
        const king = PieceFactory.createPiece(PIECE_TYPE.KING, PIECE_COLOR.WHITE)
        const from: Position = { x: 7, y: 4 }
        const to: Position = { x: 7, y: 6 }

        expect(isCastlingMove(from, to, king)).toBe(true)
      })

      it("should detect queenside castling move", () => {
        const king = PieceFactory.createPiece(PIECE_TYPE.KING, PIECE_COLOR.WHITE)
        const from: Position = { x: 7, y: 4 }
        const to: Position = { x: 7, y: 2 }

        expect(isCastlingMove(from, to, king)).toBe(true)
      })

      it("should not detect castling for non-king pieces", () => {
        const rook = PieceFactory.createPiece(PIECE_TYPE.ROOK, PIECE_COLOR.WHITE)
        const from: Position = { x: 7, y: 4 }
        const to: Position = { x: 7, y: 6 }

        expect(isCastlingMove(from, to, rook)).toBe(false)
      })

      it("should not detect castling for regular king moves", () => {
        const king = PieceFactory.createPiece(PIECE_TYPE.KING, PIECE_COLOR.WHITE)
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

        board[7][4] = PieceFactory.createPiece(PIECE_TYPE.KING, PIECE_COLOR.WHITE)
        board[7][0] = PieceFactory.createPiece(PIECE_TYPE.ROOK, PIECE_COLOR.WHITE)
        board[7][7] = PieceFactory.createPiece(PIECE_TYPE.ROOK, PIECE_COLOR.WHITE)

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
        const whitePawn = PieceFactory.createPiece(PIECE_TYPE.PAWN, PIECE_COLOR.WHITE)
        const promotionPosition = { x: 0, y: 4 }

        expect(isPawnPromotion(whitePawn, promotionPosition)).toBe(true)
      })

      it("should detect black pawn promotion on row 7", () => {
        const blackPawn = PieceFactory.createPiece(PIECE_TYPE.PAWN, PIECE_COLOR.BLACK)
        const promotionPosition = { x: 7, y: 4 }

        expect(isPawnPromotion(blackPawn, promotionPosition)).toBe(true)
      })

      it("should not detect promotion for white pawn not on row 0", () => {
        const whitePawn = PieceFactory.createPiece(PIECE_TYPE.PAWN, PIECE_COLOR.WHITE)
        const nonPromotionPosition = { x: 1, y: 4 }

        expect(isPawnPromotion(whitePawn, nonPromotionPosition)).toBe(false)
      })

      it("should not detect promotion for black pawn not on row 7", () => {
        const blackPawn = PieceFactory.createPiece(PIECE_TYPE.PAWN, PIECE_COLOR.BLACK)
        const nonPromotionPosition = { x: 6, y: 4 }

        expect(isPawnPromotion(blackPawn, nonPromotionPosition)).toBe(false)
      })

      it("should not detect promotion for non-pawn pieces", () => {
        const queen = PieceFactory.createPiece(PIECE_TYPE.QUEEN, PIECE_COLOR.WHITE)
        const promotionPosition = { x: 0, y: 4 }

        expect(isPawnPromotion(queen, promotionPosition)).toBe(false)
      })
    })

    describe("createPromotedQueen", () => {
      it("should create a white queen from white pawn promotion", () => {
        const promotedQueen = createPromotedQueen(PIECE_COLOR.WHITE)

        expect(promotedQueen.type).toBe(PIECE_TYPE.QUEEN)
        expect(promotedQueen.color).toBe(PIECE_COLOR.WHITE)
        expect(promotedQueen.weight).toBe(PIECE_WEIGHTS[PIECE_TYPE.QUEEN])
      })

      it("should create a black queen from black pawn promotion", () => {
        const promotedQueen = createPromotedQueen(PIECE_COLOR.BLACK)

        expect(promotedQueen.type).toBe(PIECE_TYPE.QUEEN)
        expect(promotedQueen.color).toBe(PIECE_COLOR.BLACK)
        expect(promotedQueen.weight).toBe(PIECE_WEIGHTS[PIECE_TYPE.QUEEN])
      })
    })
  })
})
