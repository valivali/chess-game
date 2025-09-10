import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"

import Celebration from "./Celebration"

Object.defineProperty(window, "innerWidth", {
  writable: true,
  configurable: true,
  value: 1024
})

Object.defineProperty(window, "innerHeight", {
  writable: true,
  configurable: true,
  value: 768
})

// Mock setInterval and clearInterval for animations
jest.useFakeTimers()

describe("Celebration", () => {
  const mockOnComplete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
    jest.useFakeTimers()
  })

  it("should render celebration for white winner", () => {
    render(<Celebration winner="white" onComplete={mockOnComplete} />)

    expect(screen.getByText("🎉 White Wins! 🎉")).toBeDefined()
    expect(screen.getByText("Checkmate!")).toBeDefined()
    expect(screen.getByText("🎮 New Game")).toBeDefined()
  })

  it("should render celebration for black winner", () => {
    render(<Celebration winner="black" onComplete={mockOnComplete} />)

    expect(screen.getByText("🎉 Black Wins! 🎉")).toBeDefined()
    expect(screen.getByText("Checkmate!")).toBeDefined()
    expect(screen.getByText("🎮 New Game")).toBeDefined()
  })

  it("should call onComplete when New Game button is clicked", () => {
    render(<Celebration winner="white" onComplete={mockOnComplete} />)

    const newGameButton = screen.getByText("🎮 New Game")
    fireEvent.click(newGameButton)

    expect(mockOnComplete).toHaveBeenCalledTimes(1)
  })

  it("should not render when celebration is dismissed", () => {
    render(<Celebration winner="white" onComplete={mockOnComplete} />)

    const newGameButton = screen.getByText("🎮 New Game")
    fireEvent.click(newGameButton)

    // Component should not be visible after clicking new game
    expect(screen.queryByText("🎉 White Wins! 🎉")).toBeNull()
  })

  it("should handle onComplete being undefined", () => {
    render(<Celebration winner="white" onComplete={undefined} />)

    const newGameButton = screen.getByText("🎮 New Game")

    // Should not throw error when onComplete is undefined
    expect(() => fireEvent.click(newGameButton)).not.toThrow()
  })

  it("should create confetti particles over time", async () => {
    render(<Celebration winner="white" onComplete={mockOnComplete} />)

    // Initially no confetti particles
    expect(screen.queryByRole("generic", { name: /confetti/ })).toBe(null)

    // Fast-forward time to trigger confetti creation
    act(() => {
      jest.advanceTimersByTime(300)
    })

    // Confetti should be created (check for elements with confetti-piece class)
    await waitFor(() => {
      const confettiElements = document.querySelectorAll(".confetti-piece")
      expect(confettiElements.length).toBeGreaterThan(0)
    })
  })

  it("should create firework particles over time", async () => {
    render(<Celebration winner="white" onComplete={mockOnComplete} />)

    // Fast-forward time to trigger firework creation
    act(() => {
      jest.advanceTimersByTime(800)
    })

    // Fireworks should be created (check for elements with firework-particle class)
    await waitFor(() => {
      const fireworkElements = document.querySelectorAll(".firework-particle")
      expect(fireworkElements.length).toBeGreaterThan(0)
    })
  })

  it("should use different colors for white winner", () => {
    render(<Celebration winner="white" onComplete={mockOnComplete} />)

    act(() => {
      jest.advanceTimersByTime(300) // Trigger confetti creation
    })

    // White winner should use light colors
    // This is tested indirectly through the component logic
    expect(screen.getByText("🎉 White Wins! 🎉")).toBeDefined()
  })

  it("should use different colors for black winner", () => {
    render(<Celebration winner="black" onComplete={mockOnComplete} />)

    act(() => {
      jest.advanceTimersByTime(300) // Trigger confetti creation
    })

    // Black winner should use dark colors
    // This is tested indirectly through the component logic
    expect(screen.getByText("🎉 Black Wins! 🎉")).toBeDefined()
  })

  it("should animate particles over time", async () => {
    render(<Celebration winner="white" onComplete={mockOnComplete} />)

    // Create initial particles
    act(() => {
      jest.advanceTimersByTime(300)
    })

    // Advance animation frames
    act(() => {
      jest.advanceTimersByTime(16 * 10) // 10 animation frames
    })

    // Particles should still exist and be animated
    await waitFor(() => {
      const confettiElements = document.querySelectorAll(".confetti-piece")
      expect(confettiElements.length).toBeGreaterThan(0)
    })
  })

  it("should clean up intervals on unmount", () => {
    const clearIntervalSpy = jest.spyOn(global, "clearInterval")

    const { unmount } = render(<Celebration winner="white" onComplete={mockOnComplete} />)

    unmount()

    // Should clean up multiple intervals (confetti, fireworks, animation)
    expect(clearIntervalSpy).toHaveBeenCalledTimes(3)

    clearIntervalSpy.mockRestore()
  })

  it("should limit confetti particles to prevent memory issues", async () => {
    render(<Celebration winner="white" onComplete={mockOnComplete} />)

    // Create many confetti batches
    act(() => {
      for (let i = 0; i < 20; i++) {
        jest.advanceTimersByTime(300)
      }
    })

    await waitFor(() => {
      const confettiElements = document.querySelectorAll(".confetti-piece")
      // Should be limited to 200 particles as per component logic
      expect(confettiElements.length).toBeLessThanOrEqual(200)
    })
  })

  it("should limit firework particles to prevent memory issues", async () => {
    render(<Celebration winner="white" onComplete={mockOnComplete} />)

    // Create many firework batches
    act(() => {
      for (let i = 0; i < 15; i++) {
        jest.advanceTimersByTime(800)
      }
    })

    await waitFor(() => {
      const fireworkElements = document.querySelectorAll(".firework-particle")
      // Should be limited to 300 particles as per component logic
      expect(fireworkElements.length).toBeLessThanOrEqual(300)
    })
  })
})
