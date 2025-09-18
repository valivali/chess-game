import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { renderHook } from "@testing-library/react"

import { PIECE_COLOR, PIECE_TYPE } from "../../components/ChessBoard"
import type { ChessBoard, Position } from "../../components/ChessBoard/ChessBoard.types"
import type { IChessPiece } from "../../components/pieces"
import { PieceFactory } from "../../components/pieces"
import { createInitialBoard } from "../../utils/board"
import { useMoveLogic } from "./useMoveLogic"

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
    const mockKing: IChessPiece = PieceFactory.createPiece(PIECE_TYPE.KING, PIECE_COLOR.WHITE)

    it("should handle regular king move", () => {
      const targetPiece: IChessPiece = PieceFactory.createPiece(PIECE_TYPE.PAWN, PIECE_COLOR.BLACK)

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
      const mockRook: IChessPiece = PieceFactory.createPiece(PIECE_TYPE.ROOK, PIECE_COLOR.WHITE)

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
      const mockRook: IChessPiece = PieceFactory.createPiece(PIECE_TYPE.ROOK, PIECE_COLOR.WHITE)

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
    const mockPawn: IChessPiece = PieceFactory.createPiece(PIECE_TYPE.PAWN, PIECE_COLOR.WHITE)

    it("should handle regular pawn move", () => {
      const targetPiece: IChessPiece = PieceFactory.createPiece(PIECE_TYPE.PAWN, PIECE_COLOR.BLACK)

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
      const whitePawn = PieceFactory.createPiece(PIECE_TYPE.PAWN, PIECE_COLOR.WHITE)
      const blackPawn = PieceFactory.createPiece(PIECE_TYPE.PAWN, PIECE_COLOR.BLACK)

      const pawnFromPos: Position = { x: 3, y: 3 }
      const pawnToPos: Position = { x: 2, y: 4 }
      const enPassantTarget: Position = { x: 2, y: 4 }

      mockBoard[pawnFromPos.x][pawnFromPos.y] = whitePawn
      mockBoard[pawnFromPos.x][pawnToPos.y] = blackPawn

      const { result } = renderHook(() => useMoveLogic())
      const { executePieceMove } = result.current

      const moveResult = executePieceMove(whitePawn, pawnFromPos, pawnToPos, mockBoard, enPassantTarget)

      expect(moveResult.capturedPiece).toBe(blackPawn)
      expect(mockBoard[pawnToPos.x][pawnToPos.y]).toBe(whitePawn)
      expect(mockBoard[pawnFromPos.x][pawnFromPos.y]).toBeNull()
      expect(mockBoard[pawnFromPos.x][pawnToPos.y]).toBeNull()
    })

    it("should handle pawn promotion", () => {
      const whitePawn = PieceFactory.createPiece(PIECE_TYPE.PAWN, PIECE_COLOR.WHITE)

      const promotionFromPos: Position = { x: 1, y: 3 }
      const promotionToPos: Position = { x: 0, y: 3 }

      mockBoard[promotionFromPos.x][promotionFromPos.y] = whitePawn

      const { result } = renderHook(() => useMoveLogic())
      const { executePieceMove } = result.current

      executePieceMove(whitePawn, promotionFromPos, promotionToPos, mockBoard, null)

      const promotedPiece = mockBoard[promotionToPos.x][promotionToPos.y]
      expect(promotedPiece?.type).toBe(PIECE_TYPE.QUEEN)
      expect(promotedPiece?.color).toBe(PIECE_COLOR.WHITE)
      expect(mockBoard[promotionFromPos.x][promotionFromPos.y]).toBeNull()
    })

    it("should set en passant target for double pawn move", () => {
      const doubleMoveFrom: Position = { x: 6, y: 3 }
      const doubleMoveTo: Position = { x: 4, y: 3 }

      mockBoard[doubleMoveFrom.x][doubleMoveFrom.y] = mockPawn

      const { result } = renderHook(() => useMoveLogic())
      const { executePieceMove } = result.current

      const moveResult = executePieceMove(mockPawn, doubleMoveFrom, doubleMoveTo, mockBoard, null)

      expect(moveResult.newEnPassantTarget).toEqual({ x: 5, y: 3 })
    })

    it("should not set en passant target for single pawn move", () => {
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
        const piece: IChessPiece = PieceFactory.createPiece(type, PIECE_COLOR.WHITE)

        const targetPiece: IChessPiece = PieceFactory.createPiece(PIECE_TYPE.PAWN, PIECE_COLOR.BLACK)

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
