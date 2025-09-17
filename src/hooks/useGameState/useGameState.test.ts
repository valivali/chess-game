import { describe, expect, it } from "@jest/globals"
import { act, renderHook } from "@testing-library/react"

import { GAME_STATUS, PIECE_COLOR } from "../../components/ChessBoard"
import type { ChessPiece, Move, Position } from "../../components/ChessBoard/ChessBoard.types"
import { createInitialBoard } from "../../utils/board"
import { createInitialCastlingRights } from "../../utils/moves"
import { useGameState } from "./useGameState"

describe("useGameState", () => {
  const mockMove: Move = {
    from: { x: 1, y: 0 },
    to: { x: 3, y: 0 }
  }

  const mockWhitePawn: ChessPiece = {
    type: "pawn",
    color: PIECE_COLOR.WHITE,
    weight: 1
  }

  const mockBlackQueen: ChessPiece = {
    type: "queen",
    color: PIECE_COLOR.BLACK,
    weight: 9
  }

  describe("initial state", () => {
    it("should initialize with correct default values", () => {
      const { result } = renderHook(() => useGameState())
      const [state] = result.current

      expect(state.board).toEqual(createInitialBoard())
      expect(state.currentPlayer).toBe(PIECE_COLOR.WHITE)
      expect(state.enPassantTarget).toBeNull()
      expect(state.gameStatus).toBe(GAME_STATUS.PLAYING)
      expect(state.winner).toBeNull()
      expect(state.whiteCapturedPieces).toEqual([])
      expect(state.blackCapturedPieces).toEqual([])
      expect(state.castlingRights).toEqual(createInitialCastlingRights())
      expect(state.lastMove).toBeNull()
    })
  })

  describe("board management", () => {
    it("should update board state", () => {
      const { result } = renderHook(() => useGameState())
      const [, actions] = result.current
      const newBoard = createInitialBoard()
      newBoard[0][0] = null

      act(() => {
        actions.setBoard(newBoard)
      })

      const [state] = result.current
      expect(state.board).toBe(newBoard)
      expect(state.board[0][0]).toBeNull()
    })
  })

  describe("player management", () => {
    it("should update current player", () => {
      const { result } = renderHook(() => useGameState())
      const [, actions] = result.current

      act(() => {
        actions.setCurrentPlayer(PIECE_COLOR.BLACK)
      })

      const [state] = result.current
      expect(state.currentPlayer).toBe(PIECE_COLOR.BLACK)
    })

    it("should switch player from white to black", () => {
      const { result } = renderHook(() => useGameState())
      const [, actions] = result.current

      act(() => {
        actions.switchPlayer()
      })

      const [state] = result.current
      expect(state.currentPlayer).toBe(PIECE_COLOR.BLACK)
    })

    it("should switch player from black to white", () => {
      const { result } = renderHook(() => useGameState())
      const [, actions] = result.current

      act(() => {
        actions.setCurrentPlayer(PIECE_COLOR.BLACK)
      })

      act(() => {
        actions.switchPlayer()
      })

      const [state] = result.current
      expect(state.currentPlayer).toBe(PIECE_COLOR.WHITE)
    })
  })

  describe("game state management", () => {
    it("should update en passant target", () => {
      const { result } = renderHook(() => useGameState())
      const [, actions] = result.current
      const enPassantPosition: Position = { x: 2, y: 3 }

      act(() => {
        actions.setEnPassantTarget(enPassantPosition)
      })

      const [state] = result.current
      expect(state.enPassantTarget).toEqual(enPassantPosition)
    })

    it("should update game status", () => {
      const { result } = renderHook(() => useGameState())
      const [, actions] = result.current

      act(() => {
        actions.setGameStatus(GAME_STATUS.CHECK)
      })

      const [state] = result.current
      expect(state.gameStatus).toBe(GAME_STATUS.CHECK)
    })

    it("should update winner", () => {
      const { result } = renderHook(() => useGameState())
      const [, actions] = result.current

      act(() => {
        actions.setWinner(PIECE_COLOR.BLACK)
      })

      const [state] = result.current
      expect(state.winner).toBe(PIECE_COLOR.BLACK)
    })

    it("should update castling rights", () => {
      const { result } = renderHook(() => useGameState())
      const [, actions] = result.current
      const newCastlingRights = {
        white: { kingside: false, queenside: true },
        black: { kingside: true, queenside: false }
      }

      act(() => {
        actions.setCastlingRights(newCastlingRights)
      })

      const [state] = result.current
      expect(state.castlingRights).toEqual(newCastlingRights)
    })

    it("should update last move", () => {
      const { result } = renderHook(() => useGameState())
      const [, actions] = result.current

      act(() => {
        actions.setLastMove(mockMove)
      })

      const [state] = result.current
      expect(state.lastMove).toEqual(mockMove)
    })
  })

  describe("captured pieces management", () => {
    it("should set white captured pieces", () => {
      const { result } = renderHook(() => useGameState())
      const [, actions] = result.current
      const capturedPieces = [mockBlackQueen]

      act(() => {
        actions.setWhiteCapturedPieces(capturedPieces)
      })

      const [state] = result.current
      expect(state.whiteCapturedPieces).toEqual(capturedPieces)
    })

    it("should set black captured pieces", () => {
      const { result } = renderHook(() => useGameState())
      const [, actions] = result.current
      const capturedPieces = [mockWhitePawn]

      act(() => {
        actions.setBlackCapturedPieces(capturedPieces)
      })

      const [state] = result.current
      expect(state.blackCapturedPieces).toEqual(capturedPieces)
    })

    it("should add captured piece to white collection and sort by weight", () => {
      const { result } = renderHook(() => useGameState())
      const [, actions] = result.current

      const mockBlackRook: ChessPiece = {
        type: "rook",
        color: PIECE_COLOR.BLACK,
        weight: 5
      }

      act(() => {
        actions.addCapturedPiece(mockWhitePawn, PIECE_COLOR.WHITE) // Weight: 1
      })

      act(() => {
        actions.addCapturedPiece(mockBlackQueen, PIECE_COLOR.WHITE) // Weight: 9
      })

      act(() => {
        actions.addCapturedPiece(mockBlackRook, PIECE_COLOR.WHITE) // Weight: 5
      })

      const [state] = result.current
      expect(state.whiteCapturedPieces).toEqual([mockBlackQueen, mockBlackRook, mockWhitePawn])
    })

    it("should add captured piece to black collection and sort by weight", () => {
      const { result } = renderHook(() => useGameState())
      const [, actions] = result.current

      const mockWhiteKnight: ChessPiece = {
        type: "knight",
        color: PIECE_COLOR.WHITE,
        weight: 3
      }

      const mockWhiteQueen: ChessPiece = {
        type: "queen",
        color: PIECE_COLOR.WHITE,
        weight: 9
      }

      act(() => {
        actions.addCapturedPiece(mockWhitePawn, PIECE_COLOR.BLACK) // Weight: 1
      })

      act(() => {
        actions.addCapturedPiece(mockWhiteQueen, PIECE_COLOR.BLACK) // Weight: 9
      })

      act(() => {
        actions.addCapturedPiece(mockWhiteKnight, PIECE_COLOR.BLACK) // Weight: 3
      })

      const [state] = result.current
      expect(state.blackCapturedPieces).toEqual([mockWhiteQueen, mockWhiteKnight, mockWhitePawn])
    })
  })

  describe("game reset", () => {
    it("should reset all state to initial values", () => {
      const { result } = renderHook(() => useGameState())
      const [, actions] = result.current

      act(() => {
        actions.setCurrentPlayer(PIECE_COLOR.BLACK)
        actions.setGameStatus(GAME_STATUS.CHECKMATE)
        actions.setWinner(PIECE_COLOR.BLACK)
        actions.setLastMove(mockMove)
        actions.addCapturedPiece(mockBlackQueen, PIECE_COLOR.WHITE)
        actions.setEnPassantTarget({ x: 2, y: 3 })
      })

      act(() => {
        actions.resetGame()
      })

      const [state] = result.current
      expect(state.board).toEqual(createInitialBoard())
      expect(state.currentPlayer).toBe(PIECE_COLOR.WHITE)
      expect(state.enPassantTarget).toBeNull()
      expect(state.gameStatus).toBe(GAME_STATUS.PLAYING)
      expect(state.winner).toBeNull()
      expect(state.whiteCapturedPieces).toEqual([])
      expect(state.blackCapturedPieces).toEqual([])
      expect(state.castlingRights).toEqual(createInitialCastlingRights())
      expect(state.lastMove).toBeNull()
    })
  })

  describe("hook stability", () => {
    it("should return stable function references", () => {
      const { result, rerender } = renderHook(() => useGameState())
      const [, firstActions] = result.current

      rerender()
      const [, secondActions] = result.current

      expect(firstActions.resetGame).toBe(secondActions.resetGame)
      expect(firstActions.switchPlayer).toBe(secondActions.switchPlayer)
      expect(firstActions.addCapturedPiece).toBe(secondActions.addCapturedPiece)
    })
  })

  describe("state consistency", () => {
    it("should maintain consistent state across multiple operations", () => {
      const { result } = renderHook(() => useGameState())
      const [, actions] = result.current

      act(() => {
        actions.setCurrentPlayer(PIECE_COLOR.BLACK)
        actions.setGameStatus(GAME_STATUS.CHECK)
        actions.addCapturedPiece(mockBlackQueen, PIECE_COLOR.WHITE)
        actions.setLastMove(mockMove)
      })

      const [state] = result.current
      expect(state.currentPlayer).toBe(PIECE_COLOR.BLACK)
      expect(state.gameStatus).toBe(GAME_STATUS.CHECK)
      expect(state.whiteCapturedPieces).toEqual([mockBlackQueen])
      expect(state.lastMove).toEqual(mockMove)
    })
  })
})
