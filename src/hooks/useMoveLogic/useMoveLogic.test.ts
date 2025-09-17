import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { renderHook } from "@testing-library/react"

import { CASTLING_SIDE, PIECE_COLOR, PIECE_TYPE } from "../../components/ChessBoard"
import type { ChessBoard, ChessPiece, Position } from "../../components/ChessBoard/ChessBoard.types"
import { createInitialBoard } from "../../utils/board"
import * as movesUtils from "../../utils/moves"
import { useMoveLogic } from "./useMoveLogic"

jest.mock("../../utils/moves", () => {
  const actual = jest.requireActual("../../utils/moves")
  return Object.assign({}, actual, {
    isCastlingMove: jest.fn(),
    getCastlingSide: jest.fn(),
    isEnPassantCapture: jest.fn(),
    isPawnPromotion: jest.fn(),
    createPromotedQueen: jest.fn()
  })
})

const mockMovesUtils = movesUtils as jest.Mocked<typeof movesUtils>

describe("useMoveLogic", () => {
  let mockBoard: ChessBoard
  const mockFromPosition: Position = { x: 0, y: 0 }
  const mockToPosition: Position = { x: 1, y: 1 }

  beforeEach(() => {
    mockBoard = createInitialBoard()
    jest.clearAllMocks()
  })

  describe("createBoardCopy", () => {
    it("should create a deep copy of the board", () => {
      const { result } = renderHook(() => useMoveLogic())
      const { createBoardCopy } = result.current

      const boardCopy = createBoardCopy(mockBoard)

      expect(boardCopy).toEqual(mockBoard)
      expect(boardCopy).not.toBe(mockBoard)
      expect(boardCopy[0]).not.toBe(mockBoard[0])
    })

    it("should create independent copies that do not affect original", () => {
      const { result } = renderHook(() => useMoveLogic())
      const { createBoardCopy } = result.current

      const boardCopy = createBoardCopy(mockBoard)
      const originalPiece = mockBoard[0][0]

      boardCopy[0][0] = null

      expect(mockBoard[0][0]).toBe(originalPiece)
      expect(boardCopy[0][0]).toBeNull()
    })
  })

  describe("executePieceMove - King moves", () => {
    const mockKing: ChessPiece = {
      type: PIECE_TYPE.KING,
      color: PIECE_COLOR.WHITE,
      weight: 0
    }

    it("should handle regular king move", () => {
      mockMovesUtils.isCastlingMove.mockReturnValue(false)
      const targetPiece: ChessPiece = {
        type: PIECE_TYPE.PAWN,
        color: PIECE_COLOR.BLACK,
        weight: 1
      }

      mockBoard[mockToPosition.x][mockToPosition.y] = targetPiece
      mockBoard[mockFromPosition.x][mockFromPosition.y] = mockKing

      const { result } = renderHook(() => useMoveLogic())
      const { executePieceMove } = result.current

      const moveResult = executePieceMove(mockKing, mockFromPosition, mockToPosition, mockBoard, null)

      expect(moveResult.capturedPiece).toBe(targetPiece)
      expect(moveResult.newEnPassantTarget).toBeNull()
      expect(mockBoard[mockToPosition.x][mockToPosition.y]).toBe(mockKing)
      expect(mockBoard[mockFromPosition.x][mockFromPosition.y]).toBeNull()
    })

    it("should handle castling move", () => {
      mockMovesUtils.isCastlingMove.mockReturnValue(true)
      mockMovesUtils.getCastlingSide.mockReturnValue(CASTLING_SIDE.KINGSIDE)

      const mockRook: ChessPiece = {
        type: PIECE_TYPE.ROOK,
        color: PIECE_COLOR.WHITE,
        weight: 5
      }

      const kingFromPos: Position = { x: 7, y: 4 }
      const kingToPos: Position = { x: 7, y: 6 }
      mockBoard[7][4] = mockKing
      mockBoard[7][7] = mockRook

      const { result } = renderHook(() => useMoveLogic())
      const { executePieceMove } = result.current

      const moveResult = executePieceMove(mockKing, kingFromPos, kingToPos, mockBoard, null)

      expect(moveResult.capturedPiece).toBeNull()
      expect(moveResult.newEnPassantTarget).toBeNull()
      expect(mockBoard[7][6]).toBe(mockKing)
      expect(mockBoard[7][5]).toBe(mockRook)
      expect(mockBoard[7][4]).toBeNull()
      expect(mockBoard[7][7]).toBeNull()
    })

    it("should handle queenside castling", () => {
      mockMovesUtils.isCastlingMove.mockReturnValue(true)
      mockMovesUtils.getCastlingSide.mockReturnValue(CASTLING_SIDE.QUEENSIDE)

      const mockRook: ChessPiece = {
        type: PIECE_TYPE.ROOK,
        color: PIECE_COLOR.WHITE,
        weight: 5
      }

      const kingFromPos: Position = { x: 7, y: 4 }
      const kingToPos: Position = { x: 7, y: 2 }
      mockBoard[7][4] = mockKing
      mockBoard[7][0] = mockRook

      const { result } = renderHook(() => useMoveLogic())
      const { executePieceMove } = result.current

      executePieceMove(mockKing, kingFromPos, kingToPos, mockBoard, null)

      expect(mockBoard[7][2]).toBe(mockKing)
      expect(mockBoard[7][3]).toBe(mockRook)
      expect(mockBoard[7][4]).toBeNull()
      expect(mockBoard[7][0]).toBeNull()
    })
  })

  describe("executePieceMove - Pawn moves", () => {
    const mockPawn: ChessPiece = {
      type: PIECE_TYPE.PAWN,
      color: PIECE_COLOR.WHITE,
      weight: 1
    }

    const mockQueen: ChessPiece = {
      type: PIECE_TYPE.QUEEN,
      color: PIECE_COLOR.WHITE,
      weight: 9
    }

    it("should handle regular pawn move", () => {
      mockMovesUtils.isEnPassantCapture.mockReturnValue(false)
      mockMovesUtils.isPawnPromotion.mockReturnValue(false)

      const targetPiece: ChessPiece = {
        type: PIECE_TYPE.PAWN,
        color: PIECE_COLOR.BLACK,
        weight: 1
      }

      mockBoard[mockToPosition.x][mockToPosition.y] = targetPiece
      mockBoard[mockFromPosition.x][mockFromPosition.y] = mockPawn

      const { result } = renderHook(() => useMoveLogic())
      const { executePieceMove } = result.current

      const moveResult = executePieceMove(mockPawn, mockFromPosition, mockToPosition, mockBoard, null)

      expect(moveResult.capturedPiece).toBe(targetPiece)
      expect(mockBoard[mockToPosition.x][mockToPosition.y]).toBe(mockPawn)
      expect(mockBoard[mockFromPosition.x][mockFromPosition.y]).toBeNull()
    })

    it("should handle en passant capture", () => {
      mockMovesUtils.isEnPassantCapture.mockReturnValue(true)
      mockMovesUtils.isPawnPromotion.mockReturnValue(false)

      const enPassantTarget: Position = { x: 3, y: 4 }
      const capturedPawn: ChessPiece = {
        type: PIECE_TYPE.PAWN,
        color: PIECE_COLOR.BLACK,
        weight: 1
      }

      const pawnFromPos: Position = { x: 3, y: 3 }
      const pawnToPos: Position = { x: 2, y: 4 }

      mockBoard[pawnFromPos.x][pawnFromPos.y] = mockPawn
      mockBoard[pawnFromPos.x][pawnToPos.y] = capturedPawn

      const { result } = renderHook(() => useMoveLogic())
      const { executePieceMove } = result.current

      const moveResult = executePieceMove(mockPawn, pawnFromPos, pawnToPos, mockBoard, enPassantTarget)

      expect(moveResult.capturedPiece).toBe(capturedPawn)
      expect(mockBoard[pawnToPos.x][pawnToPos.y]).toBe(mockPawn)
      expect(mockBoard[pawnFromPos.x][pawnFromPos.y]).toBeNull()
      expect(mockBoard[pawnFromPos.x][pawnToPos.y]).toBeNull()
    })

    it("should handle pawn promotion", () => {
      mockMovesUtils.isEnPassantCapture.mockReturnValue(false)
      mockMovesUtils.isPawnPromotion.mockReturnValue(true)
      mockMovesUtils.createPromotedQueen.mockReturnValue(mockQueen)

      const promotionFromPos: Position = { x: 1, y: 3 }
      const promotionToPos: Position = { x: 0, y: 3 }

      mockBoard[promotionFromPos.x][promotionFromPos.y] = mockPawn

      const { result } = renderHook(() => useMoveLogic())
      const { executePieceMove } = result.current

      executePieceMove(mockPawn, promotionFromPos, promotionToPos, mockBoard, null)

      expect(mockBoard[promotionToPos.x][promotionToPos.y]).toBe(mockQueen)
      expect(mockBoard[promotionFromPos.x][promotionFromPos.y]).toBeNull()
      expect(mockMovesUtils.createPromotedQueen).toHaveBeenCalledWith(PIECE_COLOR.WHITE)
    })

    it("should set en passant target for double pawn move", () => {
      mockMovesUtils.isEnPassantCapture.mockReturnValue(false)
      mockMovesUtils.isPawnPromotion.mockReturnValue(false)

      const doubleMoveFrom: Position = { x: 6, y: 3 }
      const doubleMoveTo: Position = { x: 4, y: 3 }

      mockBoard[doubleMoveFrom.x][doubleMoveFrom.y] = mockPawn

      const { result } = renderHook(() => useMoveLogic())
      const { executePieceMove } = result.current

      const moveResult = executePieceMove(mockPawn, doubleMoveFrom, doubleMoveTo, mockBoard, null)

      expect(moveResult.newEnPassantTarget).toEqual({ x: 5, y: 3 })
    })

    it("should not set en passant target for single pawn move", () => {
      mockMovesUtils.isEnPassantCapture.mockReturnValue(false)
      mockMovesUtils.isPawnPromotion.mockReturnValue(false)

      const singleMoveFrom: Position = { x: 5, y: 3 }
      const singleMoveTo: Position = { x: 4, y: 3 }

      mockBoard[singleMoveFrom.x][singleMoveFrom.y] = mockPawn

      const { result } = renderHook(() => useMoveLogic())
      const { executePieceMove } = result.current

      const moveResult = executePieceMove(mockPawn, singleMoveFrom, singleMoveTo, mockBoard, null)

      expect(moveResult.newEnPassantTarget).toBeNull()
    })
  })

  describe("executePieceMove - Other pieces", () => {
    const testPieces = [
      { type: PIECE_TYPE.ROOK, symbol: "♖" },
      { type: PIECE_TYPE.KNIGHT, symbol: "♘" },
      { type: PIECE_TYPE.BISHOP, symbol: "♗" },
      { type: PIECE_TYPE.QUEEN, symbol: "♕" }
    ]

    testPieces.forEach(({ type }) => {
      it(`should handle ${type} move`, () => {
        const piece: ChessPiece = {
          type,
          color: PIECE_COLOR.WHITE,
          weight: 5
        }

        const targetPiece: ChessPiece = {
          type: PIECE_TYPE.PAWN,
          color: PIECE_COLOR.BLACK,
          weight: 1
        }

        mockBoard[mockToPosition.x][mockToPosition.y] = targetPiece
        mockBoard[mockFromPosition.x][mockFromPosition.y] = piece

        const { result } = renderHook(() => useMoveLogic())
        const { executePieceMove } = result.current

        const moveResult = executePieceMove(piece, mockFromPosition, mockToPosition, mockBoard, null)

        expect(moveResult.capturedPiece).toBe(targetPiece)
        expect(moveResult.newEnPassantTarget).toBeNull()
        expect(mockBoard[mockToPosition.x][mockToPosition.y]).toBe(piece)
        expect(mockBoard[mockFromPosition.x][mockFromPosition.y]).toBeNull()
      })
    })
  })

  describe("hook stability", () => {
    it("should return stable function references", () => {
      const { result, rerender } = renderHook(() => useMoveLogic())
      const firstRender = result.current

      rerender()
      const secondRender = result.current

      expect(firstRender.executePieceMove).toBe(secondRender.executePieceMove)
      expect(firstRender.createBoardCopy).toBe(secondRender.createBoardCopy)
    })
  })
})
