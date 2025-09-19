import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { fireEvent, render, screen } from "@testing-library/react"

import type { ChessPiece, Position } from "../ChessBoard/ChessBoard.types"
import { PIECE_COLOR, PIECE_TYPE } from "../ChessBoard/ChessBoard.types"
import { PieceFactory } from "../pieces"
import ChessSquare from "./ChessSquare"

// Mock the ChessPiece component
jest.mock("../ui/chess-piece", () => ({
  ChessPiece: function MockChessPiece({ piece }: { piece: ChessPiece }) {
    return <div data-testid={`piece-${piece.type}-${piece.color}`}>{piece.type}</div>
  }
}))

describe("ChessSquare", () => {
  const mockPosition: Position = { x: 3, y: 4 }
  const mockPiece = PieceFactory.createPiece(PIECE_TYPE.PAWN, PIECE_COLOR.WHITE)

  const defaultProps = {
    position: mockPosition,
    piece: null,
    isLight: true,
    isSelected: false,
    isValidMove: false,
    isHighlighted: false,
    onClick: jest.fn(),
    onDragStart: jest.fn(),
    onDragOver: jest.fn(),
    onDrop: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should render a light square correctly", () => {
    render(<ChessSquare {...defaultProps} isLight={true} />)

    const square = document.querySelector(".chess-square") as HTMLElement
    expect(square.classList.contains("chess-square")).toBe(true)
    expect(square.classList.contains("chess-square--light")).toBe(true)
    expect(square.classList.contains("chess-square--dark")).toBe(false)
  })

  it("should render a dark square correctly", () => {
    render(<ChessSquare {...defaultProps} isLight={false} />)

    const square = document.querySelector(".chess-square") as HTMLElement
    expect(square.classList.contains("chess-square")).toBe(true)
    expect(square.classList.contains("chess-square--dark")).toBe(true)
    expect(square.classList.contains("chess-square--light")).toBe(false)
  })

  it("should render a selected square with correct classes", () => {
    render(<ChessSquare {...defaultProps} isSelected={true} />)

    const square = document.querySelector(".chess-square") as HTMLElement
    expect(square.classList.contains("chess-square--selected")).toBe(true)
  })

  it("should render a valid move square with correct classes", () => {
    render(<ChessSquare {...defaultProps} isValidMove={true} />)

    const square = document.querySelector(".chess-square") as HTMLElement
    expect(square.classList.contains("chess-square--valid-move")).toBe(true)
  })

  it("should render a highlighted square with correct classes", () => {
    render(<ChessSquare {...defaultProps} isHighlighted={true} />)

    const square = document.querySelector(".chess-square") as HTMLElement
    expect(square.classList.contains("chess-square--highlighted")).toBe(true)
  })

  it("should render multiple state classes when multiple states are true", () => {
    render(<ChessSquare {...defaultProps} isSelected={true} isValidMove={true} isHighlighted={true} />)

    const square = document.querySelector(".chess-square") as HTMLElement
    expect(square.classList.contains("chess-square--selected")).toBe(true)
    expect(square.classList.contains("chess-square--valid-move")).toBe(true)
    expect(square.classList.contains("chess-square--highlighted")).toBe(true)
  })

  it("should render a piece when piece prop is provided", () => {
    render(<ChessSquare {...defaultProps} piece={mockPiece} />)

    expect(screen.getByTestId("piece-pawn-white")).toBeDefined()
  })

  it("should not render a piece when piece prop is null", () => {
    render(<ChessSquare {...defaultProps} piece={null} />)

    expect(screen.queryByTestId("piece-pawn-white")).toBeNull()
  })

  it("should call onClick when square is clicked", () => {
    const mockOnClick = jest.fn()
    render(<ChessSquare {...defaultProps} onClick={mockOnClick} />)

    const square = document.querySelector(".chess-square") as HTMLElement
    fireEvent.click(square)

    expect(mockOnClick).toHaveBeenCalledWith(mockPosition)
  })

  it("should call onDragOver when dragging over square", () => {
    const mockOnDragOver = jest.fn()
    render(<ChessSquare {...defaultProps} onDragOver={mockOnDragOver} />)

    const square = document.querySelector(".chess-square") as HTMLElement
    fireEvent.dragOver(square)

    expect(mockOnDragOver).toHaveBeenCalled()
  })

  it("should call onDrop when dropping on square", () => {
    const mockOnDrop = jest.fn()
    render(<ChessSquare {...defaultProps} onDrop={mockOnDrop} />)

    const square = document.querySelector(".chess-square") as HTMLElement
    const dropEvent = new DragEvent("drop")
    fireEvent.drop(square, dropEvent)

    expect(mockOnDrop).toHaveBeenCalledWith(expect.any(Object), mockPosition)
  })

  it("should make piece draggable and call onDragStart when piece is dragged", () => {
    const mockOnDragStart = jest.fn()
    render(<ChessSquare {...defaultProps} piece={mockPiece} onDragStart={mockOnDragStart} />)

    const pieceContainer = document.querySelector(".chess-piece-container")
    expect(pieceContainer?.getAttribute("draggable")).toBe("true")

    const dragEvent = new DragEvent("dragstart")
    fireEvent.dragStart(pieceContainer!, dragEvent)

    expect(mockOnDragStart).toHaveBeenCalledWith(expect.any(Object), mockPiece, mockPosition)
  })

  it("should handle complex scenarios with all props set", () => {
    const mockOnClick = jest.fn()
    const mockOnDragStart = jest.fn()
    const mockOnDragOver = jest.fn()
    const mockOnDrop = jest.fn()

    render(
      <ChessSquare
        position={mockPosition}
        piece={mockPiece}
        isLight={false}
        isSelected={true}
        isValidMove={true}
        isHighlighted={true}
        onClick={mockOnClick}
        onDragStart={mockOnDragStart}
        onDragOver={mockOnDragOver}
        onDrop={mockOnDrop}
      />
    )

    const square = document.querySelector(".chess-square") as HTMLElement

    // Check all classes are applied
    expect(square.classList.contains("chess-square")).toBe(true)
    expect(square.classList.contains("chess-square--dark")).toBe(true)
    expect(square.classList.contains("chess-square--selected")).toBe(true)
    expect(square.classList.contains("chess-square--valid-move")).toBe(true)
    expect(square.classList.contains("chess-square--highlighted")).toBe(true)
    expect(square.classList.contains("chess-square--dark")).toBe(true)
    expect(square.classList.contains("chess-square--valid-move")).toBe(true)
    expect(square.classList.contains("chess-square--highlighted")).toBe(true)

    // Check piece is rendered
    expect(screen.getByTestId("piece-pawn-white")).toBeDefined()

    // Test interactions
    fireEvent.click(square)
    expect(mockOnClick).toHaveBeenCalledWith(mockPosition)

    fireEvent.dragOver(square)
    expect(mockOnDragOver).toHaveBeenCalled()

    const dropEvent = new DragEvent("drop")
    fireEvent.drop(square, dropEvent)
    expect(mockOnDrop).toHaveBeenCalledWith(expect.any(Object), mockPosition)
  })
})
