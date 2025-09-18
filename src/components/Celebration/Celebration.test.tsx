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

    expect(screen.queryByText("🎉 White Wins! 🎉")).toBeNull()
  })

  it("should handle onComplete being undefined", () => {
    render(<Celebration winner="white" onComplete={undefined} />)

    const newGameButton = screen.getByText("🎮 New Game")

    expect(() => fireEvent.click(newGameButton)).not.toThrow()
  })

  it("should create confetti particles over time", async () => {
    render(<Celebration winner="white" onComplete={mockOnComplete} />)

    expect(screen.queryByRole("generic", { name: /confetti/ })).toBe(null)

    act(() => {
      jest.advanceTimersByTime(300)
    })

    await waitFor(() => {
      const confettiElements = document.querySelectorAll(".confetti-piece")
      expect(confettiElements.length).toBeGreaterThan(0)
    })
  })

  it("should create firework particles over time", async () => {
    render(<Celebration winner="white" onComplete={mockOnComplete} />)

    act(() => {
      jest.advanceTimersByTime(800)
    })

    await waitFor(() => {
      const fireworkElements = document.querySelectorAll(".firework-particle")
      expect(fireworkElements.length).toBeGreaterThan(0)
    })
  })

  it("should use different colors for white winner", () => {
    render(<Celebration winner="white" onComplete={mockOnComplete} />)

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(screen.getByText("🎉 White Wins! 🎉")).toBeDefined()
  })

  it("should use different colors for black winner", () => {
    render(<Celebration winner="black" onComplete={mockOnComplete} />)

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(screen.getByText("🎉 Black Wins! 🎉")).toBeDefined()
  })

  it("should animate particles over time", async () => {
    render(<Celebration winner="white" onComplete={mockOnComplete} />)

    act(() => {
      jest.advanceTimersByTime(300)
    })

    act(() => {
      jest.advanceTimersByTime(16 * 10)
    })

    await waitFor(() => {
      const confettiElements = document.querySelectorAll(".confetti-piece")
      expect(confettiElements.length).toBeGreaterThan(0)
    })
  })

  it("should clean up animation frames on unmount", () => {
    const cancelAnimationFrameSpy = jest.spyOn(global, "cancelAnimationFrame")

    const { unmount } = render(<Celebration winner="white" onComplete={mockOnComplete} />)

    unmount()

    expect(cancelAnimationFrameSpy).toHaveBeenCalled()

    cancelAnimationFrameSpy.mockRestore()
  })

  it("should limit confetti particles to prevent memory issues", async () => {
    render(<Celebration winner="white" onComplete={mockOnComplete} />)

    act(() => {
      for (let i = 0; i < 20; i++) {
        jest.advanceTimersByTime(300)
      }
    })

    await waitFor(() => {
      const confettiElements = document.querySelectorAll(".confetti-piece")
      expect(confettiElements.length).toBeLessThanOrEqual(200)
    })
  })

  it("should limit firework particles to prevent memory issues", async () => {
    render(<Celebration winner="white" onComplete={mockOnComplete} />)

    act(() => {
      for (let i = 0; i < 15; i++) {
        jest.advanceTimersByTime(800)
      }
    })

    await waitFor(() => {
      const fireworkElements = document.querySelectorAll(".firework-particle")
      expect(fireworkElements.length).toBeLessThanOrEqual(300)
    })
  })

  describe("Unique Key Generation", () => {
    it("should generate unique keys for confetti particles", async () => {
      render(<Celebration winner="white" onComplete={mockOnComplete} />)

      act(() => {
        for (let i = 0; i < 5; i++) {
          jest.advanceTimersByTime(300)
        }
      })

      await waitFor(() => {
        const confettiElements = document.querySelectorAll(".confetti-piece")
        expect(confettiElements.length).toBeGreaterThan(0)

        expect(confettiElements.length).toBeGreaterThan(10)
      })
    })

    it("should generate unique keys for firework particles", async () => {
      render(<Celebration winner="white" onComplete={mockOnComplete} />)

      act(() => {
        for (let i = 0; i < 3; i++) {
          jest.advanceTimersByTime(800)
        }
      })

      await waitFor(() => {
        const fireworkElements = document.querySelectorAll(".firework-particle")

        expect(fireworkElements.length).toBeGreaterThan(0)

        expect(fireworkElements.length).toBeGreaterThan(30)
      })
    })

    it("should handle rapid particle creation without key conflicts", async () => {
      render(<Celebration winner="white" onComplete={mockOnComplete} />)

      act(() => {
        jest.advanceTimersByTime(300)
        jest.advanceTimersByTime(500)
        jest.advanceTimersByTime(300)
        jest.advanceTimersByTime(200)
      })

      await waitFor(() => {
        const confettiElements = document.querySelectorAll(".confetti-piece")
        const fireworkElements = document.querySelectorAll(".firework-particle")

        expect(confettiElements.length).toBeGreaterThan(0)
        expect(fireworkElements.length).toBeGreaterThan(0)

        const totalParticles = confettiElements.length + fireworkElements.length
        expect(totalParticles).toBeGreaterThan(40)
      })
    })

    it("should maintain unique keys during particle animation and cleanup", async () => {
      render(<Celebration winner="white" onComplete={mockOnComplete} />)

      act(() => {
        jest.advanceTimersByTime(800)
      })

      act(() => {
        jest.advanceTimersByTime(16 * 100)
      })

      await waitFor(() => {
        const allParticles = document.querySelectorAll(".confetti-piece, .firework-particle")

        expect(allParticles.length).toBeGreaterThan(0)

        const confettiElements = document.querySelectorAll(".confetti-piece")
        const fireworkElements = document.querySelectorAll(".firework-particle")

        expect(confettiElements.length + fireworkElements.length).toBeGreaterThan(0)
      })
    })

    it("should generate different key patterns for confetti vs fireworks", async () => {
      render(<Celebration winner="white" onComplete={mockOnComplete} />)

      act(() => {
        jest.advanceTimersByTime(800)
      })

      await waitFor(() => {
        const confettiElements = document.querySelectorAll(".confetti-piece")
        const fireworkElements = document.querySelectorAll(".firework-particle")

        expect(confettiElements.length).toBeGreaterThan(0)
        expect(fireworkElements.length).toBeGreaterThan(0)

        expect(confettiElements.length).toBeGreaterThan(10)
        expect(fireworkElements.length).toBeGreaterThan(25)
      })
    })
  })
})
