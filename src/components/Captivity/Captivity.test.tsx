import { describe, expect, it } from "@jest/globals"
import { render, screen } from "@testing-library/react"

import type { ChessPiece } from "../ChessBoard/chessBoard.types"
import { PIECE_COLOR, PIECE_TYPE, PIECE_WEIGHTS } from "../ChessBoard/chessBoard.types"
import Captivity from "./Captivity"

describe("Captivity", () => {
  it("renders empty state when no pieces are captured", () => {
    const { container } = render(<Captivity capturedPieces={[]} />)

    // Should not show title or score by default
    expect(() => screen.getByText("White Captures")).toThrow()
    expect(() => screen.getByText("Score: 0")).toThrow()

    // Should render captivity container
    const captivityElement = container.querySelector(".captivity")
    expect(captivityElement).toBeDefined()

    // Should have empty pieces container
    const piecesElement = container.querySelector(".captivity__pieces")
    expect(piecesElement).toBeDefined()
    expect(piecesElement?.children.length).toBe(0)
  })

  it("renders captured pieces with correct weights", () => {
    const capturedPieces: ChessPiece[] = [
      { type: PIECE_TYPE.PAWN, color: PIECE_COLOR.BLACK, weight: PIECE_WEIGHTS[PIECE_TYPE.PAWN] },
      { type: PIECE_TYPE.QUEEN, color: PIECE_COLOR.BLACK, weight: PIECE_WEIGHTS[PIECE_TYPE.QUEEN] },
      { type: PIECE_TYPE.ROOK, color: PIECE_COLOR.BLACK, weight: PIECE_WEIGHTS[PIECE_TYPE.ROOK] }
    ]

    render(<Captivity capturedPieces={capturedPieces} />)

    // Should not show title by default, but should show pieces
    expect(screen.getByText("1")).toBeDefined()
    expect(screen.getByText("9")).toBeDefined()
    expect(screen.getByText("5")).toBeDefined()
  })

  it("renders black player captures correctly", () => {
    const capturedPieces: ChessPiece[] = [{ type: PIECE_TYPE.BISHOP, color: PIECE_COLOR.WHITE, weight: PIECE_WEIGHTS[PIECE_TYPE.BISHOP] }]

    render(<Captivity capturedPieces={capturedPieces} />)

    // Should show the piece weight
    expect(screen.getByText("3")).toBeDefined()
  })

  it("applies custom className", () => {
    const { container } = render(<Captivity capturedPieces={[]} className="custom-class" />)

    const element = container.firstChild as HTMLElement
    expect(element.className).toContain("captivity")
    expect(element.className).toContain("custom-class")
  })

  it("shows advantage when scoreDifference is provided", () => {
    const capturedPieces: ChessPiece[] = [{ type: PIECE_TYPE.QUEEN, color: PIECE_COLOR.BLACK, weight: PIECE_WEIGHTS[PIECE_TYPE.QUEEN] }]

    render(<Captivity capturedPieces={capturedPieces} scoreDifference={5} />)

    expect(screen.getByText("+5")).toBeDefined()
  })

  it("does not show advantage when scoreDifference is 0 or negative", () => {
    const capturedPieces: ChessPiece[] = [{ type: PIECE_TYPE.PAWN, color: PIECE_COLOR.BLACK, weight: PIECE_WEIGHTS[PIECE_TYPE.PAWN] }]

    render(<Captivity capturedPieces={capturedPieces} scoreDifference={0} />)

    expect(() => screen.getByText("+0")).toThrow()
  })

  it("does not show advantage when scoreDifference is undefined", () => {
    const capturedPieces: ChessPiece[] = [{ type: PIECE_TYPE.PAWN, color: PIECE_COLOR.BLACK, weight: PIECE_WEIGHTS[PIECE_TYPE.PAWN] }]

    render(<Captivity capturedPieces={capturedPieces} />)

    const advantageElements = document.querySelectorAll(".captivity__advantage")
    expect(advantageElements.length).toBe(0)
  })
})
