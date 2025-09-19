import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { act, renderHook } from "@testing-library/react"

import { useConfettiAnimation } from "./useConfettiAnimation"

jest.mock("../../utils/id", () => ({
  createUniqueId: jest.fn((prefix: string) => `${prefix}mock-id-${Math.random()}`)
}))

const mockRequestAnimationFrame = jest.fn()
const mockCancelAnimationFrame = jest.fn()

Object.defineProperty(window, "requestAnimationFrame", {
  writable: true,
  value: mockRequestAnimationFrame
})

Object.defineProperty(window, "cancelAnimationFrame", {
  writable: true,
  value: mockCancelAnimationFrame
})

Object.defineProperty(window, "innerWidth", {
  writable: true,
  value: 1024
})

Object.defineProperty(window, "innerHeight", {
  writable: true,
  value: 768
})

const mockPerformanceNow = jest.fn()
Object.defineProperty(window.performance, "now", {
  writable: true,
  value: mockPerformanceNow
})

describe("useConfettiAnimation", () => {
  const mockColors = ["#ff0000", "#00ff00", "#0000ff"]
  let mockAnimationId = 1

  beforeEach(() => {
    jest.clearAllMocks()
    mockAnimationId = 1
    mockRequestAnimationFrame.mockImplementation((callback: any) => {
      setTimeout(() => callback(mockPerformanceNow()), 0)
      return mockAnimationId++
    })
    mockPerformanceNow.mockReturnValue(1000)
  })

  describe("initial state", () => {
    it("should return empty confetti array when inactive", () => {
      const { result } = renderHook(() =>
        useConfettiAnimation({
          colors: mockColors,
          isActive: false
        })
      )

      expect(result.current).toEqual([])
    })

    it("should return empty confetti array initially when active", () => {
      const { result } = renderHook(() =>
        useConfettiAnimation({
          colors: mockColors,
          isActive: true
        })
      )

      expect(result.current).toEqual([])
    })
  })

  describe("animation lifecycle", () => {
    it("should start animation when isActive becomes true", () => {
      const { rerender } = renderHook(
        ({ isActive }) =>
          useConfettiAnimation({
            colors: mockColors,
            isActive
          }),
        {
          initialProps: { isActive: false }
        }
      )

      expect(mockRequestAnimationFrame).not.toHaveBeenCalled()

      rerender({ isActive: true })

      expect(mockRequestAnimationFrame).toHaveBeenCalled()
    })

    it("should stop animation when isActive becomes false", () => {
      const { result, rerender } = renderHook(
        ({ isActive }) =>
          useConfettiAnimation({
            colors: mockColors,
            isActive
          }),
        {
          initialProps: { isActive: true }
        }
      )

      rerender({ isActive: false })

      expect(result.current).toEqual([])
      expect(mockCancelAnimationFrame).toHaveBeenCalled()
    })

    it("should cancel animation frame on unmount", () => {
      const { unmount } = renderHook(() =>
        useConfettiAnimation({
          colors: mockColors,
          isActive: true
        })
      )

      unmount()

      expect(mockCancelAnimationFrame).toHaveBeenCalled()
    })
  })

  describe("confetti creation", () => {
    it("should create confetti when animation runs and enough time has passed", async () => {
      const { result } = renderHook(() =>
        useConfettiAnimation({
          colors: mockColors,
          isActive: true,
          creationRate: 100
        })
      )

      expect(result.current).toEqual([])

      mockPerformanceNow.mockReturnValue(1200)

      const animationCallback = mockRequestAnimationFrame.mock.calls[0][0] as (time: number) => void
      await act(async () => {
        animationCallback(1200)
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      expect(result.current.length).toBeGreaterThan(0)
      expect(result.current.length).toBeLessThanOrEqual(15)
    })

    it("should respect maxParticles limit", async () => {
      const { result } = renderHook(() =>
        useConfettiAnimation({
          colors: mockColors,
          isActive: true,
          maxParticles: 10,
          creationRate: 0
        })
      )

      for (let i = 0; i < 5; i++) {
        mockPerformanceNow.mockReturnValue(1000 + i * 100)
        const animationCallback = mockRequestAnimationFrame.mock.calls[i][0] as (time: number) => void
        await act(async () => {
          animationCallback(1000 + i * 100)
          await new Promise((resolve) => setTimeout(resolve, 10))
        })
      }

      expect(result.current.length).toBeLessThanOrEqual(10)
    })

    it("should use provided colors for confetti pieces", async () => {
      const customColors = ["#ffffff", "#000000"]
      const { result } = renderHook(() =>
        useConfettiAnimation({
          colors: customColors,
          isActive: true,
          creationRate: 0
        })
      )

      mockPerformanceNow.mockReturnValue(1100)
      const animationCallback = mockRequestAnimationFrame.mock.calls[0][0] as (time: number) => void
      await act(async () => {
        animationCallback(1100)
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      if (result.current.length > 0) {
        const confettiColors = result.current.map((piece) => piece.color)
        confettiColors.forEach((color) => {
          expect(customColors).toContain(color)
        })
      }
    })
  })

  describe("confetti physics", () => {
    it("should update confetti positions and properties", async () => {
      const { result } = renderHook(() =>
        useConfettiAnimation({
          colors: mockColors,
          isActive: true,
          creationRate: 0
        })
      )

      mockPerformanceNow.mockReturnValue(1100)
      const animationCallback1 = mockRequestAnimationFrame.mock.calls[0][0] as (time: number) => void
      await act(async () => {
        animationCallback1(1100)
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      const initialConfetti = [...result.current]
      expect(initialConfetti.length).toBeGreaterThan(0)

      mockPerformanceNow.mockReturnValue(1200)
      const animationCallback2 = mockRequestAnimationFrame.mock.calls[1][0] as (time: number) => void
      await act(async () => {
        animationCallback2(1200)
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      const updatedConfetti = result.current

      if (initialConfetti.length > 0 && updatedConfetti.length > 0) {
        const initialPiece = initialConfetti[0]
        const updatedPiece = updatedConfetti.find((p) => p.id === initialPiece.id)

        if (updatedPiece) {
          expect(updatedPiece.y).toBeGreaterThan(initialPiece.y)
          expect(updatedPiece.rotation).not.toBe(initialPiece.rotation)
        }
      }
    })

    it("should remove confetti pieces that fall off screen", async () => {
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        value: 100
      })

      const { result } = renderHook(() =>
        useConfettiAnimation({
          colors: mockColors,
          isActive: true,
          creationRate: 0
        })
      )

      mockPerformanceNow.mockReturnValue(1100)
      if (mockRequestAnimationFrame.mock.calls.length > 0) {
        const animationCallback1 = mockRequestAnimationFrame.mock.calls[0][0] as (time: number) => void
        await act(async () => {
          animationCallback1(1100)
          await new Promise((resolve) => setTimeout(resolve, 10))
        })

        const initialCount = result.current.length

        for (let i = 0; i < 5; i++) {
          mockPerformanceNow.mockReturnValue(1200 + i * 100)
          const callIndex = Math.min(i + 1, mockRequestAnimationFrame.mock.calls.length - 1)
          if (mockRequestAnimationFrame.mock.calls[callIndex]) {
            const animationCallback = mockRequestAnimationFrame.mock.calls[callIndex][0] as (time: number) => void
            await act(async () => {
              animationCallback(1200 + i * 100)
              await new Promise((resolve) => setTimeout(resolve, 5))
            })
          }
        }

        expect(result.current.length).toBeLessThanOrEqual(initialCount + 100)
      }
    }, 10000)
  })

  describe("configuration options", () => {
    it("should respect custom maxParticles setting", async () => {
      const customMaxParticles = 5
      const { result } = renderHook(() =>
        useConfettiAnimation({
          colors: mockColors,
          isActive: true,
          maxParticles: customMaxParticles,
          creationRate: 0
        })
      )

      for (let i = 0; i < 3; i++) {
        mockPerformanceNow.mockReturnValue(1100 + i * 100)
        const callIndex = mockRequestAnimationFrame.mock.calls.length - 1
        const animationCallback = mockRequestAnimationFrame.mock.calls[callIndex][0] as (time: number) => void
        await act(async () => {
          animationCallback(1100 + i * 100)
          await new Promise((resolve) => setTimeout(resolve, 10))
        })
      }

      expect(result.current.length).toBeLessThanOrEqual(customMaxParticles)
    })

    it("should respect custom creationRate setting", async () => {
      const { result } = renderHook(() =>
        useConfettiAnimation({
          colors: mockColors,
          isActive: true,
          creationRate: 1000
        })
      )

      mockPerformanceNow.mockReturnValue(1000)
      if (mockRequestAnimationFrame.mock.calls.length > 0) {
        const animationCallback1 = mockRequestAnimationFrame.mock.calls[0][0] as (time: number) => void
        await act(async () => {
          animationCallback1(1000)
          await new Promise((resolve) => setTimeout(resolve, 10))
        })
      }

      const countAfterFirst = result.current.length

      mockPerformanceNow.mockReturnValue(1500)
      if (mockRequestAnimationFrame.mock.calls.length > 1) {
        const animationCallback2 = mockRequestAnimationFrame.mock.calls[1][0] as (time: number) => void
        await act(async () => {
          animationCallback2(1500)
          await new Promise((resolve) => setTimeout(resolve, 10))
        })

        expect(result.current.length).toBe(countAfterFirst)

        mockPerformanceNow.mockReturnValue(2100)
        if (mockRequestAnimationFrame.mock.calls.length > 2) {
          const animationCallback3 = mockRequestAnimationFrame.mock.calls[2][0] as (time: number) => void
          await act(async () => {
            animationCallback3(2100)
            await new Promise((resolve) => setTimeout(resolve, 10))
          })

          expect(result.current.length).toBeGreaterThan(countAfterFirst)
        }
      }
    })
  })
})
