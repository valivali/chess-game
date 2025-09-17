import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { act, renderHook } from "@testing-library/react"

import { GAME_STATUS, PIECE_COLOR } from "../../components/ChessBoard"
import type { ChessPiece, Move, Position } from "../../components/ChessBoard/ChessBoard.types"
import { createInitialBoard } from "../../utils/board"
import { createInitialCastlingRights } from "../../utils/moves"
import * as movesUtils from "../../utils/moves"
import { useChessGame } from "./useChessGame"

jest.mock("../useGameState", () => ({
  useGameState: () => [
    {
      board: [],
      currentPlayer: "white",
      enPassantTarget: null,
      gameStatus: "playing",
      winner: null,
      whiteCapturedPieces: [],
      blackCapturedPieces: [],
      castlingRights: { whiteKingside: true, whiteQueenside: true, blackKingside: true, blackQueenside: true },
      lastMove: null
    },
    {
      setBoard: jest.fn(),
      setEnPassantTarget: jest.fn(),
      setCastlingRights: jest.fn(),
      setLastMove: jest.fn(),
      switchPlayer: jest.fn(),
      addCapturedPiece: jest.fn(),
      setGameStatus: jest.fn(),
      setWinner: jest.fn(),
      resetGame: jest.fn()
    }
  ]
}))

jest.mock("../useGameStatus", () => ({
  useGameStatus: () => ({
    checkForGameEnd: jest.fn().mockReturnValue({
      status: "playing",
      isGameOver: false,
      winner: null
    })
  })
}))

jest.mock("../useMoveLogic", () => ({
  useMoveLogic: () => ({
    executePieceMove: jest.fn().mockReturnValue({
      capturedPiece: null,
      newEnPassantTarget: null
    }),
    createBoardCopy: jest.fn().mockReturnValue([])
  })
}))

jest.mock("../usePieceInteraction", () => ({
  usePieceInteraction: () => [
    {
      selectedPiecePosition: null,
      validMoves: [],
      draggedPiece: null
    },
    {
      handleSquareClick: jest.fn(),
      handleDragStart: jest.fn(),
      handleDragOver: jest.fn(),
      handleDrop: jest.fn()
    }
  ]
}))

jest.mock("../useUIState", () => ({
  useUIState: () => [
    {
      showCelebration: false,
      lastMove: null
    },
    {
      setLastMove: jest.fn(),
      setShowCelebration: jest.fn(),
      handleCelebrationComplete: jest.fn(),
      isSquareHighlighted: jest.fn().mockReturnValue(false)
    }
  ]
}))

// Mock moves utils
jest.mock("../../utils/moves", () => {
  const actual = jest.requireActual("../../utils/moves") as any
  return {
    ...actual,
    updateCastlingRights: jest.fn()
  }
})

const mockMovesUtils = movesUtils as jest.Mocked<typeof movesUtils>

describe("useChessGame", () => {
  const mockPosition1: Position = { x: 0, y: 0 }
  const mockPosition2: Position = { x: 1, y: 1 }
  const mockMove: Move = { from: mockPosition1, to: mockPosition2 }

  const mockPiece: ChessPiece = {
    type: "pawn",
    color: PIECE_COLOR.WHITE,
    weight: 1
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockMovesUtils.updateCastlingRights.mockReturnValue({
      white: { kingside: true, queenside: true },
      black: { kingside: true, queenside: true }
    })
  })

  describe("hook structure", () => {
    it("should return state and actions in correct format", () => {
      const { result } = renderHook(() => useChessGame())
      const [state, actions] = result.current

      expect(state).toHaveProperty("board")
      expect(state).toHaveProperty("selectedPiecePosition")
      expect(state).toHaveProperty("validMoves")
      expect(state).toHaveProperty("currentPlayer")
      expect(state).toHaveProperty("draggedPiece")
      expect(state).toHaveProperty("enPassantTarget")
      expect(state).toHaveProperty("gameStatus")
      expect(state).toHaveProperty("showCelebration")
      expect(state).toHaveProperty("winner")
      expect(state).toHaveProperty("whiteCapturedPieces")
      expect(state).toHaveProperty("blackCapturedPieces")
      expect(state).toHaveProperty("castlingRights")
      expect(state).toHaveProperty("lastMove")

      expect(actions).toHaveProperty("makeMove")
      expect(actions).toHaveProperty("handleSquareClick")
      expect(actions).toHaveProperty("handleDragStart")
      expect(actions).toHaveProperty("handleDragOver")
      expect(actions).toHaveProperty("handleDrop")
      expect(actions).toHaveProperty("handleCelebrationComplete")
      expect(actions).toHaveProperty("isSquareHighlighted")

      expect(typeof actions.makeMove).toBe("function")
      expect(typeof actions.handleSquareClick).toBe("function")
      expect(typeof actions.handleDragStart).toBe("function")
      expect(typeof actions.handleDragOver).toBe("function")
      expect(typeof actions.handleDrop).toBe("function")
      expect(typeof actions.handleCelebrationComplete).toBe("function")
      expect(typeof actions.isSquareHighlighted).toBe("function")
    })
  })

  describe.skip("makeMove function", () => {
    it("should handle a basic move without capture", () => {
      const mockGameStateActions = {
        setBoard: jest.fn(),
        setEnPassantTarget: jest.fn(),
        setCastlingRights: jest.fn(),
        setLastMove: jest.fn(),
        switchPlayer: jest.fn(),
        addCapturedPiece: jest.fn(),
        setGameStatus: jest.fn(),
        setWinner: jest.fn(),
        resetGame: jest.fn()
      }

      const mockUIStateActions = {
        setLastMove: jest.fn(),
        setShowCelebration: jest.fn(),
        handleCelebrationComplete: jest.fn(),
        isSquareHighlighted: jest.fn()
      }

      const mockMoveLogic = {
        executePieceMove: jest.fn().mockReturnValue({
          capturedPiece: null,
          newEnPassantTarget: null
        }),
        createBoardCopy: jest.fn().mockReturnValue([[mockPiece]])
      }

      const mockGameStatus = {
        checkForGameEnd: jest.fn().mockReturnValue({
          status: GAME_STATUS.PLAYING,
          isGameOver: false,
          winner: null
        })
      }

      require("../useGameState").useGameState.mockReturnValue([
        {
          board: [[mockPiece]],
          currentPlayer: PIECE_COLOR.WHITE,
          enPassantTarget: null,
          gameStatus: GAME_STATUS.PLAYING,
          winner: null,
          whiteCapturedPieces: [],
          blackCapturedPieces: [],
          castlingRights: createInitialCastlingRights(),
          lastMove: null
        },
        mockGameStateActions
      ])

      require("../useMoveLogic").useMoveLogic.mockReturnValue(mockMoveLogic)
      require("../useGameStatus").useGameStatus.mockReturnValue(mockGameStatus)
      require("../useUIState").useUIState.mockReturnValue([{}, mockUIStateActions])

      const { result } = renderHook(() => useChessGame())
      const [, actions] = result.current

      act(() => {
        actions.makeMove(mockPosition1, mockPosition2)
      })

      expect(mockMoveLogic.createBoardCopy).toHaveBeenCalled()
      expect(mockMoveLogic.executePieceMove).toHaveBeenCalledWith(mockPiece, mockPosition1, mockPosition2, [[mockPiece]], null)
      expect(mockGameStateActions.setBoard).toHaveBeenCalled()
      expect(mockGameStateActions.setLastMove).toHaveBeenCalledWith(mockMove)
      expect(mockUIStateActions.setLastMove).toHaveBeenCalledWith(mockMove)
      expect(mockGameStateActions.switchPlayer).toHaveBeenCalled()
      expect(mockGameStatus.checkForGameEnd).toHaveBeenCalled()
    })

    it("should handle move with capture", () => {
      const capturedPiece: ChessPiece = {
        type: "pawn",
        color: PIECE_COLOR.BLACK,
        weight: 1
      }

      const mockGameStateActions = {
        setBoard: jest.fn(),
        setEnPassantTarget: jest.fn(),
        setCastlingRights: jest.fn(),
        setLastMove: jest.fn(),
        switchPlayer: jest.fn(),
        addCapturedPiece: jest.fn(),
        setGameStatus: jest.fn(),
        setWinner: jest.fn(),
        resetGame: jest.fn()
      }

      const mockMoveLogic = {
        executePieceMove: jest.fn().mockReturnValue({
          capturedPiece,
          newEnPassantTarget: null
        }),
        createBoardCopy: jest.fn().mockReturnValue([[mockPiece]])
      }

      require("../useGameState").useGameState.mockReturnValue([
        {
          board: [[mockPiece]],
          currentPlayer: PIECE_COLOR.WHITE,
          enPassantTarget: null,
          gameStatus: GAME_STATUS.PLAYING,
          winner: null,
          whiteCapturedPieces: [],
          blackCapturedPieces: [],
          castlingRights: createInitialCastlingRights(),
          lastMove: null
        },
        mockGameStateActions
      ])

      require("../useMoveLogic").useMoveLogic.mockReturnValue(mockMoveLogic)

      const { result } = renderHook(() => useChessGame())
      const [, actions] = result.current

      act(() => {
        actions.makeMove(mockPosition1, mockPosition2)
      })

      expect(mockGameStateActions.addCapturedPiece).toHaveBeenCalledWith(capturedPiece, PIECE_COLOR.WHITE)
    })

    it("should handle game ending move", () => {
      const mockGameStateActions = {
        setBoard: jest.fn(),
        setEnPassantTarget: jest.fn(),
        setCastlingRights: jest.fn(),
        setLastMove: jest.fn(),
        switchPlayer: jest.fn(),
        addCapturedPiece: jest.fn(),
        setGameStatus: jest.fn(),
        setWinner: jest.fn(),
        resetGame: jest.fn()
      }

      const mockUIStateActions = {
        setLastMove: jest.fn(),
        setShowCelebration: jest.fn(),
        handleCelebrationComplete: jest.fn(),
        isSquareHighlighted: jest.fn()
      }

      const mockGameStatus = {
        checkForGameEnd: jest.fn().mockReturnValue({
          status: GAME_STATUS.CHECKMATE,
          isGameOver: true,
          winner: PIECE_COLOR.WHITE
        })
      }

      require("../useGameState").useGameState.mockReturnValue([
        {
          board: [[mockPiece]],
          currentPlayer: PIECE_COLOR.BLACK,
          enPassantTarget: null,
          gameStatus: GAME_STATUS.PLAYING,
          winner: null,
          whiteCapturedPieces: [],
          blackCapturedPieces: [],
          castlingRights: createInitialCastlingRights(),
          lastMove: null
        },
        mockGameStateActions
      ])

      require("../useGameStatus").useGameStatus.mockReturnValue(mockGameStatus)
      require("../useUIState").useUIState.mockReturnValue([{}, mockUIStateActions])

      const { result } = renderHook(() => useChessGame())
      const [, actions] = result.current

      act(() => {
        actions.makeMove(mockPosition1, mockPosition2)
      })

      expect(mockGameStateActions.setGameStatus).toHaveBeenCalledWith(GAME_STATUS.CHECKMATE)
      expect(mockGameStateActions.setWinner).toHaveBeenCalledWith(PIECE_COLOR.WHITE)
      expect(mockUIStateActions.setShowCelebration).toHaveBeenCalledWith(true)
    })

    it("should not make move when no piece at from position", () => {
      const mockGameStateActions = {
        setBoard: jest.fn(),
        setEnPassantTarget: jest.fn(),
        setCastlingRights: jest.fn(),
        setLastMove: jest.fn(),
        switchPlayer: jest.fn(),
        addCapturedPiece: jest.fn(),
        setGameStatus: jest.fn(),
        setWinner: jest.fn(),
        resetGame: jest.fn()
      }

      const mockMoveLogic = {
        executePieceMove: jest.fn(),
        createBoardCopy: jest.fn().mockReturnValue([[null]]) // No piece at position
      }

      require("../useGameState").useGameState.mockReturnValue([
        {
          board: [[null]],
          currentPlayer: PIECE_COLOR.WHITE,
          enPassantTarget: null,
          gameStatus: GAME_STATUS.PLAYING,
          winner: null,
          whiteCapturedPieces: [],
          blackCapturedPieces: [],
          castlingRights: createInitialCastlingRights(),
          lastMove: null
        },
        mockGameStateActions
      ])

      require("../useMoveLogic").useMoveLogic.mockReturnValue(mockMoveLogic)

      const { result } = renderHook(() => useChessGame())
      const [, actions] = result.current

      act(() => {
        actions.makeMove(mockPosition1, mockPosition2)
      })

      expect(mockMoveLogic.executePieceMove).not.toHaveBeenCalled()
      expect(mockGameStateActions.setBoard).not.toHaveBeenCalled()
    })

    it("should update castling rights", () => {
      const newCastlingRights = {
        white: { kingside: false, queenside: true },
        black: { kingside: true, queenside: true }
      }

      mockMovesUtils.updateCastlingRights.mockReturnValue(newCastlingRights)

      const mockGameStateActions = {
        setBoard: jest.fn(),
        setEnPassantTarget: jest.fn(),
        setCastlingRights: jest.fn(),
        setLastMove: jest.fn(),
        switchPlayer: jest.fn(),
        addCapturedPiece: jest.fn(),
        setGameStatus: jest.fn(),
        setWinner: jest.fn(),
        resetGame: jest.fn()
      }

      const mockMoveLogic = {
        executePieceMove: jest.fn().mockReturnValue({
          capturedPiece: null,
          newEnPassantTarget: null
        }),
        createBoardCopy: jest.fn().mockReturnValue([[mockPiece]])
      }

      require("../useGameState").useGameState.mockReturnValue([
        {
          board: [[mockPiece]],
          currentPlayer: PIECE_COLOR.WHITE,
          enPassantTarget: null,
          gameStatus: GAME_STATUS.PLAYING,
          winner: null,
          whiteCapturedPieces: [],
          blackCapturedPieces: [],
          castlingRights: createInitialCastlingRights(),
          lastMove: null
        },
        mockGameStateActions
      ])

      require("../useMoveLogic").useMoveLogic.mockReturnValue(mockMoveLogic)

      const { result } = renderHook(() => useChessGame())
      const [, actions] = result.current

      act(() => {
        actions.makeMove(mockPosition1, mockPosition2)
      })

      expect(mockMovesUtils.updateCastlingRights).toHaveBeenCalledWith(createInitialCastlingRights(), mockPosition1, mockPiece)
      expect(mockGameStateActions.setCastlingRights).toHaveBeenCalledWith(newCastlingRights)
    })
  })

  describe.skip("action delegation", () => {
    it("should delegate piece interaction actions correctly", () => {
      const mockPieceInteractionActions = {
        handleSquareClick: jest.fn(),
        handleDragStart: jest.fn(),
        handleDragOver: jest.fn(),
        handleDrop: jest.fn()
      }

      require("../usePieceInteraction").usePieceInteraction.mockReturnValue([{}, mockPieceInteractionActions])

      const { result } = renderHook(() => useChessGame())
      const [, actions] = result.current

      // Test that actions are properly delegated
      expect(actions.handleSquareClick).toBe(mockPieceInteractionActions.handleSquareClick)
      expect(actions.handleDragStart).toBe(mockPieceInteractionActions.handleDragStart)
      expect(actions.handleDragOver).toBe(mockPieceInteractionActions.handleDragOver)
      expect(actions.handleDrop).toBe(mockPieceInteractionActions.handleDrop)
    })

    it("should delegate UI actions correctly", () => {
      const mockUIStateActions = {
        setLastMove: jest.fn(),
        setShowCelebration: jest.fn(),
        handleCelebrationComplete: jest.fn(),
        isSquareHighlighted: jest.fn()
      }

      require("../useUIState").useUIState.mockReturnValue([{}, mockUIStateActions])

      const { result } = renderHook(() => useChessGame())
      const [, actions] = result.current

      expect(actions.handleCelebrationComplete).toBe(mockUIStateActions.handleCelebrationComplete)
      expect(actions.isSquareHighlighted).toBe(mockUIStateActions.isSquareHighlighted)
    })
  })

  describe.skip("state combination", () => {
    it("should combine state from all hooks correctly", () => {
      const mockGameState = {
        board: createInitialBoard(),
        currentPlayer: PIECE_COLOR.BLACK,
        enPassantTarget: { x: 2, y: 3 },
        gameStatus: GAME_STATUS.CHECK,
        winner: null,
        whiteCapturedPieces: [mockPiece],
        blackCapturedPieces: [],
        castlingRights: createInitialCastlingRights(),
        lastMove: mockMove
      }

      const mockPieceInteractionState = {
        selectedPiecePosition: mockPosition1,
        validMoves: [mockPosition2],
        draggedPiece: { piece: mockPiece, from: mockPosition1 }
      }

      const mockUIState = {
        showCelebration: true,
        lastMove: mockMove
      }

      require("../useGameState").useGameState.mockReturnValue([mockGameState, {}])
      require("../usePieceInteraction").usePieceInteraction.mockReturnValue([mockPieceInteractionState, {}])
      require("../useUIState").useUIState.mockReturnValue([mockUIState, {}])

      const { result } = renderHook(() => useChessGame())
      const [state] = result.current

      expect(state.board).toBe(mockGameState.board)
      expect(state.currentPlayer).toBe(mockGameState.currentPlayer)
      expect(state.enPassantTarget).toBe(mockGameState.enPassantTarget)
      expect(state.gameStatus).toBe(mockGameState.gameStatus)
      expect(state.winner).toBe(mockGameState.winner)
      expect(state.whiteCapturedPieces).toBe(mockGameState.whiteCapturedPieces)
      expect(state.blackCapturedPieces).toBe(mockGameState.blackCapturedPieces)
      expect(state.castlingRights).toBe(mockGameState.castlingRights)
      expect(state.lastMove).toBe(mockGameState.lastMove)

      expect(state.selectedPiecePosition).toBe(mockPieceInteractionState.selectedPiecePosition)
      expect(state.validMoves).toBe(mockPieceInteractionState.validMoves)
      expect(state.draggedPiece).toBe(mockPieceInteractionState.draggedPiece)

      expect(state.showCelebration).toBe(mockUIState.showCelebration)
    })
  })

  describe.skip("hook integration", () => {
    it("should pass correct props to usePieceInteraction", () => {
      const mockGameState = {
        board: createInitialBoard(),
        currentPlayer: PIECE_COLOR.WHITE,
        enPassantTarget: null,
        gameStatus: GAME_STATUS.PLAYING,
        winner: null,
        whiteCapturedPieces: [],
        blackCapturedPieces: [],
        castlingRights: createInitialCastlingRights(),
        lastMove: null
      }

      const mockUsePieceInteraction = jest.fn().mockReturnValue([{}, {}])
      require("../usePieceInteraction").usePieceInteraction = mockUsePieceInteraction

      require("../useGameState").useGameState.mockReturnValue([mockGameState, {}])

      renderHook(() => useChessGame())

      expect(mockUsePieceInteraction).toHaveBeenCalledWith({
        board: mockGameState.board,
        currentPlayer: mockGameState.currentPlayer,
        gameStatus: mockGameState.gameStatus,
        enPassantTarget: mockGameState.enPassantTarget,
        castlingRights: mockGameState.castlingRights,
        onMoveAttempt: expect.any(Function)
      })
    })

    it("should pass correct props to useUIState", () => {
      const mockGameStateActions = {
        resetGame: jest.fn(),
        setBoard: jest.fn(),
        setEnPassantTarget: jest.fn(),
        setCastlingRights: jest.fn(),
        setLastMove: jest.fn(),
        switchPlayer: jest.fn(),
        addCapturedPiece: jest.fn(),
        setGameStatus: jest.fn(),
        setWinner: jest.fn()
      }

      const mockUseUIState = jest.fn().mockReturnValue([{}, {}])
      require("../useUIState").useUIState = mockUseUIState

      require("../useGameState").useGameState.mockReturnValue([{}, mockGameStateActions])

      renderHook(() => useChessGame())

      expect(mockUseUIState).toHaveBeenCalledWith({
        onGameReset: mockGameStateActions.resetGame
      })
    })
  })
})
