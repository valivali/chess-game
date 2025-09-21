import "@testing-library/jest-dom"

import { describe, expect, it } from "@jest/globals"
import { jest } from "@jest/globals"
import { fireEvent, render, screen } from "@testing-library/react"
import React from "react"

import { GameProvider, useGameContext } from "./GameContext"

// Test component that uses the GameContext
const TestComponent: React.FC = () => {
  const { gameId, setGameId, clearGameId } = useGameContext()

  return (
    <div>
      <div data-testid="game-id">{gameId || "No game ID"}</div>
      <button onClick={() => setGameId("test-game-123")}>Set Game ID</button>
      <button onClick={() => setGameId("different-game-456")}>Set Different ID</button>
      <button onClick={clearGameId}>Clear Game ID</button>
    </div>
  )
}

const TestComponentWithProvider: React.FC = () => (
  <GameProvider>
    <TestComponent />
  </GameProvider>
)

describe("GameContext", () => {
  it("should provide initial state with null gameId", () => {
    render(<TestComponentWithProvider />)

    expect(screen.getByTestId("game-id").textContent).toBe("No game ID")
  })

  it("should allow setting gameId", () => {
    render(<TestComponentWithProvider />)

    const setButton = screen.getByText("Set Game ID")
    fireEvent.click(setButton)

    expect(screen.getByTestId("game-id").textContent).toBe("test-game-123")
  })

  it("should allow updating gameId", () => {
    render(<TestComponentWithProvider />)

    const setButton = screen.getByText("Set Game ID")
    const setDifferentButton = screen.getByText("Set Different ID")

    fireEvent.click(setButton)
    expect(screen.getByTestId("game-id").textContent).toBe("test-game-123")

    fireEvent.click(setDifferentButton)
    expect(screen.getByTestId("game-id").textContent).toBe("different-game-456")
  })

  it("should allow clearing gameId", () => {
    render(<TestComponentWithProvider />)

    const setButton = screen.getByText("Set Game ID")
    const clearButton = screen.getByText("Clear Game ID")

    fireEvent.click(setButton)
    expect(screen.getByTestId("game-id").textContent).toBe("test-game-123")

    fireEvent.click(clearButton)
    expect(screen.getByTestId("game-id").textContent).toBe("No game ID")
  })

  it("should throw error when useGameContext is used outside provider", () => {
    // Suppress console.error for this test
    const originalError = console.error
    console.error = jest.fn()

    expect(() => render(<TestComponent />)).toThrow("useGameContext must be used within a GameProvider")

    console.error = originalError
  })
})
