import { fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"

import ChessBoard from "./ChessBoard"

// Mock the chess utilities
jest.mock("../../utils/chess", () => ({
  createInitialBoard: jest.fn(() => {
    // Create a minimal board for testing
    const board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null))
    board[0][4] = { type: "king", color: "black" }
    board[7][4] = { type: "king", color: "white" }
    board[6][4] = { type: "pawn", color: "white" }
    return board
  }),
  getLegalMoves: jest.fn(() => [
    { x: 5, y: 4 },
    { x: 4, y: 4 }
  ]),
  isCheckmate: jest.fn(() => false),
  isEnPassantCapture: jest.fn(() => false),
  isInCheck: jest.fn(() => false),
  isPositionEqual: jest.fn((pos1, pos2) => pos1.x === pos2.x && pos1.y === pos2.y),
  isStalemate: jest.fn(() => false)
}))

// Mock ChessSquare component
jest.mock("../ChessSquare", () => {
  return function MockChessSquare({ position, piece, isSelected, isValidMove, onClick, onDragStart, onDragOver, onDrop }: any) {
    return (
      <div
        data-testid={`square-${position.x}-${position.y}`}
        data-piece={piece ? `${piece.type}-${piece.color}` : "empty"}
        data-selected={isSelected}
        data-valid-move={isValidMove}
        onClick={() => onClick(position)}
        onDragStart={(e) => {
          if (piece) {
            onDragStart(e, piece, position)
          }
        }}
        onDragOver={(e) => {
          if (onDragOver) {
            onDragOver(e)
          }
        }}
        onDrop={(e) => {
          if (onDrop) {
            onDrop(e, position)
          }
        }}
      >
        {piece ? `${piece.type}-${piece.color}` : "empty"}
      </div>
    )
  }
})

// Mock Celebration component
jest.mock("../Celebration", () => {
  return function MockCelebration({ winner, onComplete }: any) {
    return (
      <div data-testid="celebration">
        <div>{winner} wins!</div>
        <button onClick={onComplete}>New Game</button>
      </div>
    )
  }
})

describe("ChessBoard", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should render the chess board with correct structure", () => {
    render(<ChessBoard />)

    expect(screen.getByText("Chess Game")).toBeInTheDocument()
    expect(screen.getByText("Current Player:")).toBeInTheDocument()
    expect(screen.getByText("white")).toBeInTheDocument()

    // Should render 64 squares (8x8)
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        expect(screen.getByTestId(`square-${row}-${col}`)).toBeInTheDocument()
      }
    }
  })

  it("should display initial board with correct pieces", () => {
    render(<ChessBoard />)

    // Check for kings in their starting positions
    expect(screen.getByTestId("square-0-4")).toHaveAttribute("data-piece", "king-black")
    expect(screen.getByTestId("square-7-4")).toHaveAttribute("data-piece", "king-white")
    expect(screen.getByTestId("square-6-4")).toHaveAttribute("data-piece", "pawn-white")
  })

  it("should handle square selection", () => {
    const { getLegalMoves } = require("../../utils/chess")
    render(<ChessBoard />)

    const pawnSquare = screen.getByTestId("square-6-4")
    fireEvent.click(pawnSquare)

    expect(getLegalMoves).toHaveBeenCalledWith({ type: "pawn", color: "white" }, { x: 6, y: 4 }, expect.any(Array), null)
  })

  it("should highlight valid moves when piece is selected", () => {
    render(<ChessBoard />)

    const pawnSquare = screen.getByTestId("square-6-4")
    fireEvent.click(pawnSquare)

    // Check that valid move squares are highlighted
    expect(screen.getByTestId("square-5-4")).toHaveAttribute("data-valid-move", "true")
    expect(screen.getByTestId("square-4-4")).toHaveAttribute("data-valid-move", "true")
  })

  it("should make a move when clicking on a valid move square", () => {
    render(<ChessBoard />)

    // Select pawn
    const pawnSquare = screen.getByTestId("square-6-4")
    fireEvent.click(pawnSquare)

    // Move to valid square
    const targetSquare = screen.getByTestId("square-5-4")
    fireEvent.click(targetSquare)

    // Current player should change to black after move
    expect(screen.getByText("black")).toBeInTheDocument()
  })

  it("should deselect piece when clicking on the same square", () => {
    render(<ChessBoard />)

    const pawnSquare = screen.getByTestId("square-6-4")

    // Select piece
    fireEvent.click(pawnSquare)
    expect(pawnSquare).toHaveAttribute("data-selected", "true")

    // Click same square again to deselect
    fireEvent.click(pawnSquare)
    expect(pawnSquare).toHaveAttribute("data-selected", "false")
  })

  it("should handle drag and drop operations", () => {
    render(<ChessBoard />)

    const pawnSquare = screen.getByTestId("square-6-4")
    const targetSquare = screen.getByTestId("square-5-4")

    // Start drag
    const dragStartEvent = new DragEvent("dragstart")
    fireEvent.dragStart(pawnSquare, dragStartEvent)

    // Drop on target
    const dropEvent = new DragEvent("drop")
    fireEvent.drop(targetSquare, dropEvent)

    // Current player should change after successful move
    expect(screen.getByText("black")).toBeInTheDocument()
  })

  it("should prevent moves when game is in checkmate", () => {
    const { isCheckmate, isInCheck, isStalemate } = require("../../utils/chess")

    // Set mocks before rendering
    isCheckmate.mockReturnValue(true)
    isInCheck.mockReturnValue(false)
    isStalemate.mockReturnValue(false)

    render(<ChessBoard />)

    // First make a move to trigger game status update
    const pawnSquare = screen.getByTestId("square-6-4")
    fireEvent.click(pawnSquare)
    const targetSquare = screen.getByTestId("square-5-4")
    fireEvent.click(targetSquare)

    // Now try to select a piece - should be prevented
    fireEvent.click(pawnSquare)
    expect(pawnSquare).toHaveAttribute("data-selected", "false")
  })

  it("should display checkmate message and show celebration", () => {
    const { isCheckmate } = require("../../utils/chess")
    isCheckmate.mockReturnValue(true)

    render(<ChessBoard />)

    // Make a move to trigger game status check
    const pawnSquare = screen.getByTestId("square-6-4")
    fireEvent.click(pawnSquare)

    const targetSquare = screen.getByTestId("square-5-4")
    fireEvent.click(targetSquare)

    // Should show checkmate message
    expect(screen.getByText(/Checkmate!/)).toBeInTheDocument()

    // Should show celebration
    expect(screen.getByTestId("celebration")).toBeInTheDocument()
  })

  it("should display check message when player is in check", () => {
    const { isInCheck, isCheckmate, isStalemate } = require("../../utils/chess")
    // Set up the mocks to show check but not checkmate
    isInCheck.mockReturnValue(true)
    isCheckmate.mockReturnValue(false)
    isStalemate.mockReturnValue(false)

    render(<ChessBoard />)

    // Make a move to trigger game status check
    const pawnSquare = screen.getByTestId("square-6-4")
    fireEvent.click(pawnSquare)

    const targetSquare = screen.getByTestId("square-5-4")
    fireEvent.click(targetSquare)

    // Should show check message for the next player (black)
    expect(screen.getByText(/black is in check!/i)).toBeInTheDocument()
  })

  it("should display stalemate message", () => {
    const { isStalemate, isCheckmate, isInCheck } = require("../../utils/chess")
    // Set up mocks to show stalemate but not checkmate
    isStalemate.mockReturnValue(true)
    isCheckmate.mockReturnValue(false)
    isInCheck.mockReturnValue(false)

    render(<ChessBoard />)

    // Make a move to trigger game status check
    const pawnSquare = screen.getByTestId("square-6-4")
    fireEvent.click(pawnSquare)

    const targetSquare = screen.getByTestId("square-5-4")
    fireEvent.click(targetSquare)

    // Should show stalemate message
    expect(screen.getByText(/Stalemate! The game is a draw./i)).toBeInTheDocument()
  })

  it("should reset game when celebration is completed", () => {
    const { isCheckmate, createInitialBoard } = require("../../utils/chess")
    isCheckmate.mockReturnValue(true)

    render(<ChessBoard />)

    // Make a move to trigger checkmate
    const pawnSquare = screen.getByTestId("square-6-4")
    fireEvent.click(pawnSquare)

    const targetSquare = screen.getByTestId("square-5-4")
    fireEvent.click(targetSquare)

    // Click new game in celebration
    const newGameButton = screen.getByText("New Game")
    fireEvent.click(newGameButton)

    // Should reset to initial state
    expect(createInitialBoard).toHaveBeenCalled()
    expect(screen.getByText("white")).toBeInTheDocument() // Back to white's turn
    expect(screen.queryByTestId("celebration")).not.toBeInTheDocument()
  })

  it("should handle en passant capture", () => {
    const { isEnPassantCapture } = require("../../utils/chess")
    isEnPassantCapture.mockReturnValue(true)

    render(<ChessBoard />)

    // Make a move that triggers en passant
    const pawnSquare = screen.getByTestId("square-6-4")
    fireEvent.click(pawnSquare)

    const targetSquare = screen.getByTestId("square-5-4")
    fireEvent.click(targetSquare)

    // Should handle en passant logic
    expect(isEnPassantCapture).toHaveBeenCalled()
  })

  it("should prevent drag start for opponent pieces", () => {
    render(<ChessBoard />)

    const blackKingSquare = screen.getByTestId("square-0-4")
    const whitePawnSquare = screen.getByTestId("square-6-4")

    // Try to drag black piece when it's white's turn
    fireEvent.dragStart(blackKingSquare)

    // The piece should not be selected (no draggedPiece state set)
    // We can verify this by checking that dragging doesn't affect game state
    // White pawn should still be selectable
    fireEvent.click(whitePawnSquare)
    expect(whitePawnSquare).toHaveAttribute("data-selected", "true")
  })

  it("should handle drag over events", () => {
    render(<ChessBoard />)

    const whitePawnSquare = screen.getByTestId("square-6-4")
    const targetSquare = screen.getByTestId("square-5-4")

    // Start dragging a white pawn
    fireEvent.dragStart(whitePawnSquare)

    // Drag over target square (this should work without errors)
    fireEvent.dragOver(targetSquare)

    // The drag over should not cause any errors and the component should still be functional
    // We can verify by checking that the pawn is still selected
    expect(whitePawnSquare).toHaveAttribute("data-selected", "true")
  })

  it("should apply custom className", () => {
    render(<ChessBoard className="custom-board" />)

    const boardElement = document.querySelector(".chess-board")
    expect(boardElement).toHaveClass("custom-board")
  })

  it("should display game instructions", () => {
    render(<ChessBoard />)

    expect(screen.getByText(/Click on a piece to select it/)).toBeInTheDocument()
    expect(screen.getByText(/You can also drag and drop pieces/)).toBeInTheDocument()
  })
})
