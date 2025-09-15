import "@testing-library/jest-dom"

import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { render, screen } from "@testing-library/react"

import ChessBoard from "./ChessBoard"
import { PIECE_COLOR, type Position } from "./chessBoard.types"

jest.mock("../../utils/board", () => ({
  createInitialBoard: jest.fn(() =>
    Array(8)
      .fill(null)
      .map(() => Array(8).fill(null))
  )
}))

jest.mock("../../utils/moves", () => ({
  getLegalMoves: jest.fn(() => []),
  isCheckmate: jest.fn(() => false),
  isEnPassantCapture: jest.fn(() => false),
  isInCheck: jest.fn(() => false),
  isStalemate: jest.fn(() => false),
  createInitialCastlingRights: jest.fn(() => ({
    white: { kingside: true, queenside: true },
    black: { kingside: true, queenside: true }
  })),
  updateCastlingRights: jest.fn((rights) => rights),
  isCastlingMove: jest.fn(() => false),
  getCastlingSide: jest.fn(() => "kingside"),
  isPawnPromotion: jest.fn(() => false),
  createPromotedQueen: jest.fn((color) => ({ type: "queen", color, weight: 9 }))
}))

jest.mock("../../utils/position", () => ({
  isPositionEqual: jest.fn((pos1: Position, pos2: Position) => pos1.x === pos2.x && pos1.y === pos2.y),
  indicesToPosition: jest.fn((rowIndex: number, colIndex: number) => ({ x: rowIndex, y: colIndex })),
  isLightSquare: jest.fn((rowIndex: number, colIndex: number) => (rowIndex + colIndex) % 2 === 0),
  getSquareKey: jest.fn((rowIndex: number, colIndex: number) => `${rowIndex}-${colIndex}`)
}))

jest.mock("../../utils/game", () => ({
  calculateScoreAdvantages: jest.fn(() => ({ whiteAdvantage: 0, blackAdvantage: 0 })),
  getCurrentPlayerDisplayText: jest.fn((player: string) => player),
  getGameStatusClassName: jest.fn(() => "chess-board-game-status"),
  getGameStatusMessage: jest.fn(() => ""),
  isGameOver: jest.fn(() => false)
}))

jest.mock("../../hooks/useChessGame", () => ({
  useChessGame: jest.fn()
}))

jest.mock("../ChessSquare", () => {
  return function MockChessSquare({ position }: any) {
    return <div data-testid={`square-${position.x}-${position.y}`}>square</div>
  }
})

jest.mock("../Captivity", () => {
  return function MockCaptivity() {
    return <div data-testid="captivity">captivity</div>
  }
})

jest.mock("../Celebration", () => {
  return function MockCelebration() {
    return <div data-testid="celebration">celebration</div>
  }
})

describe("ChessBoard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    const mockUseChessGame = require("../../hooks/useChessGame").useChessGame
    mockUseChessGame.mockReturnValue([
      {
        board: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        selectedPiecePosition: null,
        validMoves: [],
        currentPlayer: PIECE_COLOR.WHITE,
        draggedPiece: null,
        enPassantTarget: null,
        gameStatus: "playing",
        showCelebration: false,
        winner: null,
        whiteCapturedPieces: [],
        blackCapturedPieces: [],
        castlingRights: { white: { kingside: true, queenside: true }, black: { kingside: true, queenside: true } },
        lastMove: null
      },
      {
        makeMove: jest.fn(),
        handleSquareClick: jest.fn(),
        handleDragStart: jest.fn(),
        handleDragOver: jest.fn(),
        handleDrop: jest.fn(),
        handleCelebrationComplete: jest.fn(),
        isSquareHighlighted: jest.fn(() => false)
      }
    ])
  })

  it("should render all 64 chess squares", () => {
    render(<ChessBoard />)

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        expect(screen.getByTestId(`square-${row}-${col}`)).toBeTruthy()
      }
    }
  })

  it("should render captivity components", () => {
    render(<ChessBoard />)

    const captivityElements = screen.getAllByTestId("captivity")
    expect(captivityElements).toHaveLength(2) // One for white, one for black
  })

  it("should apply custom className when provided", () => {
    const { container } = render(<ChessBoard className="custom-chess-board" />)

    const boardElement = container.querySelector(".chess-board")
    expect(boardElement?.classList.contains("custom-chess-board")).toBe(true)
  })

  it("should show celebration when game is won", () => {
    const mockUseChessGame = require("../../hooks/useChessGame").useChessGame
    mockUseChessGame.mockReturnValue([
      {
        board: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        selectedPiecePosition: null,
        validMoves: [],
        currentPlayer: PIECE_COLOR.WHITE,
        draggedPiece: null,
        enPassantTarget: null,
        gameStatus: "checkmate",
        showCelebration: true,
        winner: PIECE_COLOR.WHITE,
        whiteCapturedPieces: [],
        blackCapturedPieces: [],
        castlingRights: { white: { kingside: true, queenside: true }, black: { kingside: true, queenside: true } },
        lastMove: null
      },
      {
        makeMove: jest.fn(),
        handleSquareClick: jest.fn(),
        handleDragStart: jest.fn(),
        handleDragOver: jest.fn(),
        handleDrop: jest.fn(),
        handleCelebrationComplete: jest.fn(),
        isSquareHighlighted: jest.fn(() => false)
      }
    ])

    render(<ChessBoard />)

    expect(screen.getByTestId("celebration")).toBeTruthy()
  })
})
