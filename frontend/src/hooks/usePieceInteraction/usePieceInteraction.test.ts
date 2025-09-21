import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { act, renderHook } from "@testing-library/react"
import React from "react"

import { GAME_STATUS, PIECE_COLOR, PIECE_TYPE } from "../../components/ChessBoard"
import type { CastlingRights, ChessBoard, GameStatus, PieceColor, Position } from "../../components/ChessBoard/ChessBoard.types"
import { PieceFactory } from "../../components/pieces/PieceFactory"
import type { IChessPiece } from "../../components/pieces/pieces.types"
import { createInitialBoard } from "../../utils/board"
import { createInitialCastlingRights } from "../../utils/moves"
import * as movesUtils from "../../utils/moves"
import * as positionUtils from "../../utils/position"
import { usePieceInteraction } from "./usePieceInteraction"

jest.mock("../../utils/moves", () => {
  const actual = jest.requireActual("../../utils/moves") as any
  return {
    ...actual,
    getLegalMoves: jest.fn()
  }
})

jest.mock("../../utils/position", () => {
  const actual = jest.requireActual("../../utils/position") as object
  return {
    ...actual,
    isPositionEqual: jest.fn()
  }
})

const mockMovesUtils = movesUtils as jest.Mocked<typeof movesUtils>
const mockPositionUtils = positionUtils as jest.Mocked<typeof positionUtils>

describe("usePieceInteraction", () => {
  let mockBoard: ChessBoard
  let mockCastlingRights: CastlingRights
  let mockOnMoveAttempt: jest.Mock

  const mockPosition1: Position = { x: 0, y: 0 }
  const mockPosition2: Position = { x: 1, y: 1 }
  const mockPosition3: Position = { x: 2, y: 2 }

  const mockWhitePawn: IChessPiece = PieceFactory.createPiece(PIECE_TYPE.PAWN, PIECE_COLOR.WHITE)
  const mockBlackPawn: IChessPiece = PieceFactory.createPiece(PIECE_TYPE.PAWN, PIECE_COLOR.BLACK)

  const defaultProps = {
    board: createInitialBoard(),
    currentPlayer: PIECE_COLOR.WHITE as PieceColor,
    gameStatus: GAME_STATUS.PLAYING as GameStatus,
    enPassantTarget: null,
    castlingRights: createInitialCastlingRights(),
    onMoveAttempt: jest.fn()
  }

  beforeEach(() => {
    mockBoard = createInitialBoard()
    mockCastlingRights = createInitialCastlingRights()
    mockOnMoveAttempt = jest.fn()
    jest.clearAllMocks()

    mockMovesUtils.getLegalMoves.mockReturnValue([])
    mockPositionUtils.isPositionEqual.mockImplementation((pos1, pos2) => pos1.x === pos2.x && pos1.y === pos2.y)
  })

  describe("initial state", () => {
    it("should initialize with correct default values", () => {
      const { result } = renderHook(() => usePieceInteraction(defaultProps))
      const [state] = result.current

      expect(state.selectedPiecePosition).toBeNull()
      expect(state.validMoves).toEqual([])
      expect(state.draggedPiece).toBeNull()
    })
  })

  describe("piece selection", () => {
    it("should select a piece when clicking on current player piece", () => {
      const mockMoves = [mockPosition2, mockPosition3]
      mockMovesUtils.getLegalMoves.mockReturnValue(mockMoves)

      mockBoard[mockPosition1.x][mockPosition1.y] = mockWhitePawn

      const { result } = renderHook(() =>
        usePieceInteraction({
          ...defaultProps,
          board: mockBoard
        })
      )
      const [, actions] = result.current

      act(() => {
        actions.selectPiece(mockPosition1, mockWhitePawn)
      })

      const [state] = result.current
      expect(state.selectedPiecePosition).toEqual(mockPosition1)
      expect(state.validMoves).toEqual(mockMoves)
      expect(mockMovesUtils.getLegalMoves).toHaveBeenCalledWith(mockWhitePawn, mockPosition1, mockBoard, null, mockCastlingRights)
    })

    it("should not select opponent piece", () => {
      const { result } = renderHook(() =>
        usePieceInteraction({
          ...defaultProps,
          currentPlayer: PIECE_COLOR.WHITE
        })
      )
      const [, actions] = result.current

      act(() => {
        actions.selectPiece(mockPosition1, mockBlackPawn)
      })

      const [state] = result.current
      expect(state.selectedPiecePosition).toBeNull()
      expect(state.validMoves).toEqual([])
    })

    it("should not select piece when game is not active", () => {
      const { result } = renderHook(() =>
        usePieceInteraction({
          ...defaultProps,
          gameStatus: GAME_STATUS.CHECKMATE
        })
      )
      const [, actions] = result.current

      act(() => {
        actions.selectPiece(mockPosition1, mockWhitePawn)
      })

      const [state] = result.current
      expect(state.selectedPiecePosition).toBeNull()
      expect(state.validMoves).toEqual([])
    })

    it("should clear selection", () => {
      const mockMoves = [mockPosition2]
      mockMovesUtils.getLegalMoves.mockReturnValue(mockMoves)

      const { result } = renderHook(() => usePieceInteraction(defaultProps))
      const [, actions] = result.current

      act(() => {
        actions.selectPiece(mockPosition1, mockWhitePawn)
      })

      act(() => {
        actions.clearSelection()
      })

      const [state] = result.current
      expect(state.selectedPiecePosition).toBeNull()
      expect(state.validMoves).toEqual([])
    })
  })

  describe("square click handling", () => {
    it("should select piece when clicking on current player piece with no selection", () => {
      const mockMoves = [mockPosition2]
      mockMovesUtils.getLegalMoves.mockReturnValue(mockMoves)
      mockBoard[mockPosition1.x][mockPosition1.y] = mockWhitePawn

      const { result } = renderHook(() =>
        usePieceInteraction({
          ...defaultProps,
          board: mockBoard
        })
      )
      const [, actions] = result.current

      act(() => {
        actions.handleSquareClick(mockPosition1)
      })

      const [state] = result.current
      expect(state.selectedPiecePosition).toEqual(mockPosition1)
      expect(state.validMoves).toEqual(mockMoves)
    })

    it("should make move when clicking on valid move position", () => {
      const mockMoves = [mockPosition2]
      mockMovesUtils.getLegalMoves.mockReturnValue(mockMoves)
      mockPositionUtils.isPositionEqual.mockImplementation((pos1, pos2) => pos1.x === pos2.x && pos1.y === pos2.y)
      mockBoard[mockPosition1.x][mockPosition1.y] = mockWhitePawn

      const { result } = renderHook(() =>
        usePieceInteraction({
          ...defaultProps,
          board: mockBoard,
          onMoveAttempt: mockOnMoveAttempt
        })
      )

      act(() => {
        const [, actions] = result.current
        actions.selectPiece(mockPosition1, mockWhitePawn)
      })

      act(() => {
        const [, actions] = result.current
        actions.handleSquareClick(mockPosition2)
      })

      expect(mockOnMoveAttempt).toHaveBeenCalledWith(mockPosition1, mockPosition2)
    })

    it("should clear selection after successful move via click", () => {
      const mockMoves = [mockPosition2]
      mockMovesUtils.getLegalMoves.mockReturnValue(mockMoves)
      mockPositionUtils.isPositionEqual.mockImplementation((pos1, pos2) => pos1.x === pos2.x && pos1.y === pos2.y)
      mockBoard[mockPosition1.x][mockPosition1.y] = mockWhitePawn

      const { result } = renderHook(() =>
        usePieceInteraction({
          ...defaultProps,
          board: mockBoard,
          onMoveAttempt: mockOnMoveAttempt
        })
      )

      // Select a piece first
      act(() => {
        const [, actions] = result.current
        actions.selectPiece(mockPosition1, mockWhitePawn)
      })

      // Verify piece is selected and has valid moves
      let [state] = result.current
      expect(state.selectedPiecePosition).toEqual(mockPosition1)
      expect(state.validMoves).toEqual(mockMoves)

      // Make a valid move by clicking
      act(() => {
        const [, actions] = result.current
        actions.handleSquareClick(mockPosition2)
      })

      // Verify selection is cleared after the move
      const [finalState] = result.current
      expect(finalState.selectedPiecePosition).toBeNull()
      expect(finalState.validMoves).toEqual([])
      expect(mockOnMoveAttempt).toHaveBeenCalledWith(mockPosition1, mockPosition2)
    })

    it("should deselect piece when clicking on same selected piece", () => {
      const mockMoves = [mockPosition2]
      mockMovesUtils.getLegalMoves.mockReturnValue(mockMoves)
      mockPositionUtils.isPositionEqual.mockImplementation((pos1, pos2) => pos1.x === pos2.x && pos1.y === pos2.y)
      mockBoard[mockPosition1.x][mockPosition1.y] = mockWhitePawn

      const { result } = renderHook(() =>
        usePieceInteraction({
          ...defaultProps,
          board: mockBoard
        })
      )

      act(() => {
        const [, actions] = result.current
        actions.selectPiece(mockPosition1, mockWhitePawn)
      })

      act(() => {
        const [, currentActions] = result.current
        currentActions.handleSquareClick(mockPosition1)
      })

      const [state] = result.current
      expect(state.selectedPiecePosition).toBeNull()
      expect(state.validMoves).toEqual([])
    })

    it("should switch selection when clicking on different current player piece", () => {
      const mockMoves1 = [mockPosition2]
      const mockMoves2 = [mockPosition3]
      mockBoard[mockPosition1.x][mockPosition1.y] = mockWhitePawn
      mockBoard[mockPosition2.x][mockPosition2.y] = mockWhitePawn

      const { result } = renderHook(() =>
        usePieceInteraction({
          ...defaultProps,
          board: mockBoard
        })
      )
      const [, actions] = result.current

      mockMovesUtils.getLegalMoves.mockReturnValue(mockMoves1)
      act(() => {
        actions.selectPiece(mockPosition1, mockWhitePawn)
      })

      mockMovesUtils.getLegalMoves.mockReturnValue(mockMoves2)
      act(() => {
        actions.handleSquareClick(mockPosition2)
      })

      const [state] = result.current
      expect(state.selectedPiecePosition).toEqual(mockPosition2)
      expect(state.validMoves).toEqual(mockMoves2)
    })

    it("should clear selection when clicking on empty square (invalid move)", () => {
      const mockMoves = [mockPosition2]
      mockMovesUtils.getLegalMoves.mockReturnValue(mockMoves)
      mockBoard[mockPosition1.x][mockPosition1.y] = mockWhitePawn

      const { result } = renderHook(() =>
        usePieceInteraction({
          ...defaultProps,
          board: mockBoard
        })
      )
      const [, actions] = result.current

      act(() => {
        actions.selectPiece(mockPosition1, mockWhitePawn)
      })

      mockPositionUtils.isPositionEqual.mockImplementation((pos1, pos2) => pos1.x === pos2.x && pos1.y === pos2.y)

      act(() => {
        const [, currentActions] = result.current
        currentActions.handleSquareClick(mockPosition3)
      })

      const [state] = result.current
      expect(state.selectedPiecePosition).toBeNull()
      expect(state.validMoves).toEqual([])
    })

    it("should do nothing when game is not active", () => {
      mockBoard[mockPosition1.x][mockPosition1.y] = mockWhitePawn

      const { result } = renderHook(() =>
        usePieceInteraction({
          ...defaultProps,
          board: mockBoard,
          gameStatus: GAME_STATUS.CHECKMATE
        })
      )
      const [, actions] = result.current

      act(() => {
        actions.handleSquareClick(mockPosition1)
      })

      const [state] = result.current
      expect(state.selectedPiecePosition).toBeNull()
      expect(state.validMoves).toEqual([])
    })
  })

  describe("drag and drop", () => {
    const mockDragEvent = {
      preventDefault: jest.fn(),
      dataTransfer: {
        setData: jest.fn(),
        getData: jest.fn()
      }
    } as unknown as React.DragEvent

    beforeEach(() => {
      ;(mockDragEvent.preventDefault as jest.Mock).mockClear()
    })

    it("should start drag when dragging current player piece", () => {
      const mockMoves = [mockPosition2]
      mockMovesUtils.getLegalMoves.mockReturnValue(mockMoves)

      const { result } = renderHook(() => usePieceInteraction(defaultProps))
      const [, actions] = result.current

      act(() => {
        actions.handleDragStart(mockDragEvent, mockWhitePawn, mockPosition1)
      })

      const [state] = result.current
      expect(state.draggedPiece).toEqual({ piece: mockWhitePawn, from: mockPosition1 })
      expect(state.selectedPiecePosition).toEqual(mockPosition1)
      expect(state.validMoves).toEqual(mockMoves)
    })

    it("should prevent drag when dragging opponent piece", () => {
      const { result } = renderHook(() =>
        usePieceInteraction({
          ...defaultProps,
          currentPlayer: PIECE_COLOR.WHITE
        })
      )
      const [, actions] = result.current

      act(() => {
        actions.handleDragStart(mockDragEvent, mockBlackPawn, mockPosition1)
      })

      expect(mockDragEvent.preventDefault).toHaveBeenCalled()
      const [state] = result.current
      expect(state.draggedPiece).toBeNull()
    })

    it("should prevent drag when game is not active", () => {
      const { result } = renderHook(() =>
        usePieceInteraction({
          ...defaultProps,
          gameStatus: GAME_STATUS.STALEMATE
        })
      )
      const [, actions] = result.current

      act(() => {
        actions.handleDragStart(mockDragEvent, mockWhitePawn, mockPosition1)
      })

      expect(mockDragEvent.preventDefault).toHaveBeenCalled()
      const [state] = result.current
      expect(state.draggedPiece).toBeNull()
    })

    it("should handle drag over", () => {
      const { result } = renderHook(() => usePieceInteraction(defaultProps))
      const [, actions] = result.current

      act(() => {
        actions.handleDragOver(mockDragEvent)
      })

      expect(mockDragEvent.preventDefault).toHaveBeenCalled()
    })

    it("should handle drop on valid position", () => {
      // Set up mocks for valid move
      const mockMoves = [mockPosition2]
      mockMovesUtils.getLegalMoves.mockReturnValue(mockMoves)
      mockPositionUtils.isPositionEqual.mockImplementation((pos1, pos2) => pos1.x === pos2.x && pos1.y === pos2.y)

      const { result } = renderHook(() =>
        usePieceInteraction({
          ...defaultProps,
          onMoveAttempt: mockOnMoveAttempt
        })
      )

      act(() => {
        const [, actions] = result.current
        actions.handleDragStart(mockDragEvent, mockWhitePawn, mockPosition1)
      })

      act(() => {
        const [, currentActions] = result.current
        currentActions.handleDrop(mockDragEvent, mockPosition2)
      })

      expect(mockDragEvent.preventDefault).toHaveBeenCalled()
      expect(mockOnMoveAttempt).toHaveBeenCalledWith(mockPosition1, mockPosition2)

      const [state] = result.current
      expect(state.draggedPiece).toBeNull()
    })

    it("should clear selection after successful move via drag and drop", () => {
      // Set up mocks for valid move
      const mockMoves = [mockPosition2]
      mockMovesUtils.getLegalMoves.mockReturnValue(mockMoves)
      mockPositionUtils.isPositionEqual.mockImplementation((pos1, pos2) => pos1.x === pos2.x && pos1.y === pos2.y)

      const { result } = renderHook(() =>
        usePieceInteraction({
          ...defaultProps,
          onMoveAttempt: mockOnMoveAttempt
        })
      )

      // Start dragging a piece (this also selects it)
      act(() => {
        const [, actions] = result.current
        actions.handleDragStart(mockDragEvent, mockWhitePawn, mockPosition1)
      })

      // Verify piece is selected and has valid moves after drag start
      let [state] = result.current
      expect(state.selectedPiecePosition).toEqual(mockPosition1)
      expect(state.validMoves).toEqual(mockMoves)
      expect(state.draggedPiece).toEqual({ piece: mockWhitePawn, from: mockPosition1 })

      // Drop on valid position
      act(() => {
        const [, currentActions] = result.current
        currentActions.handleDrop(mockDragEvent, mockPosition2)
      })

      // Verify selection is cleared after the move
      const [finalState] = result.current
      expect(finalState.selectedPiecePosition).toBeNull()
      expect(finalState.validMoves).toEqual([])
      expect(finalState.draggedPiece).toBeNull()
      expect(mockOnMoveAttempt).toHaveBeenCalledWith(mockPosition1, mockPosition2)
    })

    it("should handle drop on invalid position without making move", () => {
      // Set up mocks for invalid move (no valid moves)
      mockMovesUtils.getLegalMoves.mockReturnValue([])
      mockPositionUtils.isPositionEqual.mockImplementation((pos1, pos2) => pos1.x === pos2.x && pos1.y === pos2.y)

      const { result } = renderHook(() =>
        usePieceInteraction({
          ...defaultProps,
          onMoveAttempt: mockOnMoveAttempt
        })
      )

      act(() => {
        const [, actions] = result.current
        actions.handleDragStart(mockDragEvent, mockWhitePawn, mockPosition1)
      })

      act(() => {
        const [, currentActions] = result.current
        currentActions.handleDrop(mockDragEvent, mockPosition2)
      })

      expect(mockDragEvent.preventDefault).toHaveBeenCalled()
      expect(mockOnMoveAttempt).not.toHaveBeenCalled()

      const [currentState] = result.current
      expect(currentState.draggedPiece).toBeNull()
    })

    it("should handle drop without dragged piece", () => {
      const { result } = renderHook(() =>
        usePieceInteraction({
          ...defaultProps,
          onMoveAttempt: mockOnMoveAttempt
        })
      )
      const [, actions] = result.current

      act(() => {
        actions.handleDrop(mockDragEvent, mockPosition2)
      })

      expect(mockDragEvent.preventDefault).toHaveBeenCalled()
      expect(mockOnMoveAttempt).not.toHaveBeenCalled()
    })
  })

  describe("move validation", () => {
    it("should return true for valid moves", () => {
      const mockMoves = [mockPosition1, mockPosition2]
      mockMovesUtils.getLegalMoves.mockReturnValue(mockMoves)
      mockPositionUtils.isPositionEqual.mockImplementation((pos1, pos2) => pos1.x === pos2.x && pos1.y === pos2.y)

      const { result } = renderHook(() => usePieceInteraction(defaultProps))

      // Select a piece first to have valid moves
      act(() => {
        const [, actions] = result.current
        actions.selectPiece(mockPosition1, mockWhitePawn)
      })

      // Get fresh actions after selection and check if mockPosition2 is a valid move
      const [, currentActions] = result.current
      const isValid = currentActions.isValidMove(mockPosition2)
      expect(isValid).toBe(true)
    })

    it("should return false for invalid moves", () => {
      const mockMoves = [mockPosition1, mockPosition2]
      mockMovesUtils.getLegalMoves.mockReturnValue(mockMoves)

      const { result } = renderHook(() => usePieceInteraction(defaultProps))
      const [, actions] = result.current

      act(() => {
        actions.selectPiece(mockPosition3, mockWhitePawn)
      })

      const isValid = actions.isValidMove(mockPosition3)
      expect(isValid).toBe(false)
    })

    it("should return false when no valid moves", () => {
      const { result } = renderHook(() => usePieceInteraction(defaultProps))
      const [, actions] = result.current

      const isValid = actions.isValidMove(mockPosition1)
      expect(isValid).toBe(false)
    })
  })

  describe("hook stability", () => {
    it("should return stable function references", () => {
      const { result, rerender } = renderHook(() => usePieceInteraction(defaultProps))
      const [, firstActions] = result.current

      rerender()
      const [, secondActions] = result.current

      expect(firstActions.handleSquareClick).toBe(secondActions.handleSquareClick)
      expect(firstActions.handleDragStart).toBe(secondActions.handleDragStart)
      expect(firstActions.handleDragOver).toBe(secondActions.handleDragOver)
      expect(firstActions.handleDrop).toBe(secondActions.handleDrop)
      expect(firstActions.clearSelection).toBe(secondActions.clearSelection)
      expect(firstActions.selectPiece).toBe(secondActions.selectPiece)
      expect(firstActions.isValidMove).toBe(secondActions.isValidMove)
    })
  })

  describe("game state integration", () => {
    it("should work with different game statuses", () => {
      const activeStatuses = [GAME_STATUS.PLAYING, GAME_STATUS.CHECK]
      const inactiveStatuses = [GAME_STATUS.CHECKMATE, GAME_STATUS.STALEMATE]

      activeStatuses.forEach((status) => {
        const { result } = renderHook(() =>
          usePieceInteraction({
            ...defaultProps,
            gameStatus: status
          })
        )
        const [, actions] = result.current

        act(() => {
          actions.selectPiece(mockPosition1, mockWhitePawn)
        })

        expect(mockMovesUtils.getLegalMoves).toHaveBeenCalled()
        jest.clearAllMocks()
      })

      inactiveStatuses.forEach((status) => {
        const { result } = renderHook(() =>
          usePieceInteraction({
            ...defaultProps,
            gameStatus: status
          })
        )
        const [, actions] = result.current

        act(() => {
          actions.selectPiece(mockPosition1, mockWhitePawn)
        })

        expect(mockMovesUtils.getLegalMoves).not.toHaveBeenCalled()
        jest.clearAllMocks()
      })
    })

    it("should work with different players", () => {
      const { result: whiteResult } = renderHook(() =>
        usePieceInteraction({
          ...defaultProps,
          currentPlayer: PIECE_COLOR.WHITE
        })
      )

      const { result: blackResult } = renderHook(() =>
        usePieceInteraction({
          ...defaultProps,
          currentPlayer: PIECE_COLOR.BLACK
        })
      )

      const [, whiteActions] = whiteResult.current
      const [, blackActions] = blackResult.current

      act(() => {
        whiteActions.selectPiece(mockPosition1, mockWhitePawn)
      })
      expect(mockMovesUtils.getLegalMoves).toHaveBeenCalled()
      jest.clearAllMocks()

      act(() => {
        blackActions.selectPiece(mockPosition1, mockBlackPawn)
      })
      expect(mockMovesUtils.getLegalMoves).toHaveBeenCalled()
    })
  })
})
