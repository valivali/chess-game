import { describe, expect, it } from "@jest/globals"
import { render, screen } from "@testing-library/react"

import { PIECE_COLOR, PIECE_TYPE } from "../ChessBoard/ChessBoard.types"
import type { IChessPiece } from "../pieces"
import { PieceFactory } from "../pieces"
import Captivity from "./Captivity"

describe("Captivity", () => {
  it("renders empty state when no pieces are captured", () => {
    const { container } = render(<Captivity capturedPieces={[]} />)

    expect(() => screen.getByText("White Captures")).toThrow()
    expect(() => screen.getByText("Score: 0")).toThrow()

    const captivityElement = container.querySelector(".captivity")
    expect(captivityElement).toBeDefined()

    const piecesElement = container.querySelector(".captivity__pieces")
    expect(piecesElement).toBeDefined()
    expect(piecesElement?.children.length).toBe(0)
  })

  it("renders captured pieces with correct weights", () => {
    const capturedPieces: IChessPiece[] = [
      PieceFactory.createPiece(PIECE_TYPE.PAWN, PIECE_COLOR.BLACK),
      PieceFactory.createPiece(PIECE_TYPE.QUEEN, PIECE_COLOR.BLACK),
      PieceFactory.createPiece(PIECE_TYPE.ROOK, PIECE_COLOR.BLACK)
    ]

    render(<Captivity capturedPieces={capturedPieces} />)

    expect(screen.getByText("1")).toBeDefined()
    expect(screen.getByText("9")).toBeDefined()
    expect(screen.getByText("5")).toBeDefined()
  })

  it("renders black player captures correctly", () => {
    const capturedPieces: IChessPiece[] = [PieceFactory.createPiece(PIECE_TYPE.BISHOP, PIECE_COLOR.WHITE)]

    render(<Captivity capturedPieces={capturedPieces} />)

    expect(screen.getByText("3")).toBeDefined()
  })

  it("applies custom className", () => {
    const { container } = render(<Captivity capturedPieces={[]} className="custom-class" />)

    const element = container.firstChild as HTMLElement
    expect(element.className).toContain("captivity")
    expect(element.className).toContain("custom-class")
  })

  it("shows advantage when scoreDifference is provided", () => {
    const capturedPieces: IChessPiece[] = [PieceFactory.createPiece(PIECE_TYPE.QUEEN, PIECE_COLOR.BLACK)]

    render(<Captivity capturedPieces={capturedPieces} scoreDifference={5} />)

    expect(screen.getByText("+5")).toBeDefined()
  })

  it("does not show advantage when scoreDifference is 0 or negative", () => {
    const capturedPieces: IChessPiece[] = [PieceFactory.createPiece(PIECE_TYPE.PAWN, PIECE_COLOR.BLACK)]

    render(<Captivity capturedPieces={capturedPieces} scoreDifference={0} />)

    expect(() => screen.getByText("+0")).toThrow()
  })

  it("does not show advantage when scoreDifference is undefined", () => {
    const capturedPieces: IChessPiece[] = [PieceFactory.createPiece(PIECE_TYPE.PAWN, PIECE_COLOR.BLACK)]

    render(<Captivity capturedPieces={capturedPieces} />)

    const advantageElements = document.querySelectorAll(".captivity__advantage")
    expect(advantageElements.length).toBe(0)
  })
})
