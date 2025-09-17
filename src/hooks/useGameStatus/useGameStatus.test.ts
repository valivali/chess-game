import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { renderHook } from "@testing-library/react"

import { GAME_STATUS, PIECE_COLOR } from "../../components/ChessBoard"
import type { CastlingRights, ChessBoard, Position } from "../../components/ChessBoard/ChessBoard.types"
import { createInitialBoard } from "../../utils/board"
import { createInitialCastlingRights } from "../../utils/moves"
import * as movesUtils from "../../utils/moves"
import { useGameStatus } from "./useGameStatus"

// Mock the moves utils
jest.mock("../../utils/moves", () => {
  const actual = jest.requireActual("../../utils/moves") as any
  return {
    ...actual,
    isInCheck: jest.fn(),
    isCheckmate: jest.fn(),
    isStalemate: jest.fn()
  }
})

const mockMovesUtils = movesUtils as jest.Mocked<typeof movesUtils>

describe("useGameStatus", () => {
  let mockBoard: ChessBoard
  let mockCastlingRights: CastlingRights
  let mockEnPassantTarget: Position | null

  beforeEach(() => {
    mockBoard = createInitialBoard()
    mockCastlingRights = createInitialCastlingRights()
    mockEnPassantTarget = null
    jest.clearAllMocks()
  })

  describe("determineGameStatus", () => {
    it("should return CHECKMATE when player is in checkmate", () => {
      mockMovesUtils.isInCheck.mockReturnValue(true)
      mockMovesUtils.isCheckmate.mockReturnValue(true)
      mockMovesUtils.isStalemate.mockReturnValue(false)

      const { result } = renderHook(() => useGameStatus())
      const { determineGameStatus } = result.current

      const status = determineGameStatus(mockBoard, PIECE_COLOR.WHITE, mockEnPassantTarget, mockCastlingRights)

      expect(status).toBe(GAME_STATUS.CHECKMATE)
      expect(mockMovesUtils.isCheckmate).toHaveBeenCalledWith(mockBoard, PIECE_COLOR.WHITE, mockEnPassantTarget, mockCastlingRights)
    })

    it("should return STALEMATE when player is in stalemate", () => {
      mockMovesUtils.isInCheck.mockReturnValue(false)
      mockMovesUtils.isCheckmate.mockReturnValue(false)
      mockMovesUtils.isStalemate.mockReturnValue(true)

      const { result } = renderHook(() => useGameStatus())
      const { determineGameStatus } = result.current

      const status = determineGameStatus(mockBoard, PIECE_COLOR.WHITE, mockEnPassantTarget, mockCastlingRights)

      expect(status).toBe(GAME_STATUS.STALEMATE)
      expect(mockMovesUtils.isStalemate).toHaveBeenCalledWith(mockBoard, PIECE_COLOR.WHITE, mockEnPassantTarget, mockCastlingRights)
    })

    it("should return CHECK when player is in check but not checkmate", () => {
      mockMovesUtils.isInCheck.mockReturnValue(true)
      mockMovesUtils.isCheckmate.mockReturnValue(false)
      mockMovesUtils.isStalemate.mockReturnValue(false)

      const { result } = renderHook(() => useGameStatus())
      const { determineGameStatus } = result.current

      const status = determineGameStatus(mockBoard, PIECE_COLOR.WHITE, mockEnPassantTarget, mockCastlingRights)

      expect(status).toBe(GAME_STATUS.CHECK)
      expect(mockMovesUtils.isInCheck).toHaveBeenCalledWith(mockBoard, PIECE_COLOR.WHITE)
    })

    it("should return PLAYING when player is not in check, checkmate, or stalemate", () => {
      mockMovesUtils.isInCheck.mockReturnValue(false)
      mockMovesUtils.isCheckmate.mockReturnValue(false)
      mockMovesUtils.isStalemate.mockReturnValue(false)

      const { result } = renderHook(() => useGameStatus())
      const { determineGameStatus } = result.current

      const status = determineGameStatus(mockBoard, PIECE_COLOR.WHITE, mockEnPassantTarget, mockCastlingRights)

      expect(status).toBe(GAME_STATUS.PLAYING)
    })

    it("should work for black player", () => {
      mockMovesUtils.isInCheck.mockReturnValue(true)
      mockMovesUtils.isCheckmate.mockReturnValue(false)
      mockMovesUtils.isStalemate.mockReturnValue(false)

      const { result } = renderHook(() => useGameStatus())
      const { determineGameStatus } = result.current

      const status = determineGameStatus(mockBoard, PIECE_COLOR.BLACK, mockEnPassantTarget, mockCastlingRights)

      expect(status).toBe(GAME_STATUS.CHECK)
      expect(mockMovesUtils.isInCheck).toHaveBeenCalledWith(mockBoard, PIECE_COLOR.BLACK)
    })
  })

  describe("checkForGameEnd", () => {
    it("should return correct result for checkmate scenario", () => {
      mockMovesUtils.isInCheck.mockReturnValue(true)
      mockMovesUtils.isCheckmate.mockReturnValue(true)
      mockMovesUtils.isStalemate.mockReturnValue(false)

      const { result } = renderHook(() => useGameStatus())
      const { checkForGameEnd } = result.current

      const gameEndResult = checkForGameEnd(mockBoard, PIECE_COLOR.WHITE, mockEnPassantTarget, mockCastlingRights)

      expect(gameEndResult.status).toBe(GAME_STATUS.CHECKMATE)
      expect(gameEndResult.isGameOver).toBe(true)
      expect(gameEndResult.winner).toBe(PIECE_COLOR.BLACK) // Opponent wins
    })

    it("should return correct result for stalemate scenario", () => {
      mockMovesUtils.isInCheck.mockReturnValue(false)
      mockMovesUtils.isCheckmate.mockReturnValue(false)
      mockMovesUtils.isStalemate.mockReturnValue(true)

      const { result } = renderHook(() => useGameStatus())
      const { checkForGameEnd } = result.current

      const gameEndResult = checkForGameEnd(mockBoard, PIECE_COLOR.WHITE, mockEnPassantTarget, mockCastlingRights)

      expect(gameEndResult.status).toBe(GAME_STATUS.STALEMATE)
      expect(gameEndResult.isGameOver).toBe(true)
      expect(gameEndResult.winner).toBeNull() // No winner in stalemate
    })

    it("should return correct result for ongoing game", () => {
      mockMovesUtils.isInCheck.mockReturnValue(false)
      mockMovesUtils.isCheckmate.mockReturnValue(false)
      mockMovesUtils.isStalemate.mockReturnValue(false)

      const { result } = renderHook(() => useGameStatus())
      const { checkForGameEnd } = result.current

      const gameEndResult = checkForGameEnd(mockBoard, PIECE_COLOR.WHITE, mockEnPassantTarget, mockCastlingRights)

      expect(gameEndResult.status).toBe(GAME_STATUS.PLAYING)
      expect(gameEndResult.isGameOver).toBe(false)
      expect(gameEndResult.winner).toBeNull()
    })

    it("should return correct winner for black player checkmate", () => {
      mockMovesUtils.isInCheck.mockReturnValue(true)
      mockMovesUtils.isCheckmate.mockReturnValue(true)
      mockMovesUtils.isStalemate.mockReturnValue(false)

      const { result } = renderHook(() => useGameStatus())
      const { checkForGameEnd } = result.current

      const gameEndResult = checkForGameEnd(mockBoard, PIECE_COLOR.BLACK, mockEnPassantTarget, mockCastlingRights)

      expect(gameEndResult.status).toBe(GAME_STATUS.CHECKMATE)
      expect(gameEndResult.isGameOver).toBe(true)
      expect(gameEndResult.winner).toBe(PIECE_COLOR.WHITE) // Opponent wins
    })

    it("should return correct result for check scenario (not game over)", () => {
      mockMovesUtils.isInCheck.mockReturnValue(true)
      mockMovesUtils.isCheckmate.mockReturnValue(false)
      mockMovesUtils.isStalemate.mockReturnValue(false)

      const { result } = renderHook(() => useGameStatus())
      const { checkForGameEnd } = result.current

      const gameEndResult = checkForGameEnd(mockBoard, PIECE_COLOR.WHITE, mockEnPassantTarget, mockCastlingRights)

      expect(gameEndResult.status).toBe(GAME_STATUS.CHECK)
      expect(gameEndResult.isGameOver).toBe(false)
      expect(gameEndResult.winner).toBeNull()
    })
  })

  describe("hook stability", () => {
    it("should return stable function references", () => {
      const { result, rerender } = renderHook(() => useGameStatus())
      const firstRender = result.current

      rerender()
      const secondRender = result.current

      expect(firstRender.determineGameStatus).toBe(secondRender.determineGameStatus)
      expect(firstRender.checkForGameEnd).toBe(secondRender.checkForGameEnd)
    })
  })
})
