import { describe, expect, it } from "@jest/globals"

import type { Position } from "../../components/ChessBoard/ChessBoard.types.ts"
import { createPosition, getSquareKey, indicesToPosition, isLightSquare, isPositionEqual, isValidPosition } from "./position"

describe("Position Utilities", () => {
  describe("createPosition", () => {
    it("should create a position object with x and y coordinates", () => {
      const position = createPosition(3, 4)
      expect(position).toEqual({ x: 3, y: 4 })
    })
  })

  describe("getSquareKey", () => {
    it("should create a unique key for board squares", () => {
      expect(getSquareKey(0, 0)).toBe("0-0")
      expect(getSquareKey(3, 4)).toBe("3-4")
      expect(getSquareKey(7, 7)).toBe("7-7")
    })
  })

  describe("isLightSquare", () => {
    it("should return true for light squares", () => {
      expect(isLightSquare(0, 0)).toBe(true)
      expect(isLightSquare(1, 1)).toBe(true)
      expect(isLightSquare(2, 2)).toBe(true)
    })

    it("should return false for dark squares", () => {
      expect(isLightSquare(0, 1)).toBe(false)
      expect(isLightSquare(1, 0)).toBe(false)
      expect(isLightSquare(1, 2)).toBe(false)
    })
  })

  describe("indicesToPosition", () => {
    it("should convert row and column indices to a position", () => {
      const position = indicesToPosition(3, 4)
      expect(position).toEqual({ x: 3, y: 4 })
    })
  })

  describe("isValidPosition", () => {
    it("should return true for valid board positions", () => {
      expect(isValidPosition(0, 0)).toBe(true)
      expect(isValidPosition(7, 7)).toBe(true)
      expect(isValidPosition(3, 4)).toBe(true)
    })

    it("should return false for invalid board positions", () => {
      expect(isValidPosition(-1, 0)).toBe(false)
      expect(isValidPosition(0, -1)).toBe(false)
      expect(isValidPosition(8, 0)).toBe(false)
      expect(isValidPosition(0, 8)).toBe(false)
      expect(isValidPosition(-1, -1)).toBe(false)
      expect(isValidPosition(8, 8)).toBe(false)
    })
  })

  describe("isPositionEqual", () => {
    it("should return true for equal positions", () => {
      const pos1: Position = { x: 3, y: 4 }
      const pos2: Position = { x: 3, y: 4 }
      expect(isPositionEqual(pos1, pos2)).toBe(true)
    })

    it("should return false for different positions", () => {
      const pos1: Position = { x: 3, y: 4 }
      const pos2: Position = { x: 3, y: 5 }
      const pos3: Position = { x: 4, y: 4 }
      expect(isPositionEqual(pos1, pos2)).toBe(false)
      expect(isPositionEqual(pos1, pos3)).toBe(false)
    })
  })
})
