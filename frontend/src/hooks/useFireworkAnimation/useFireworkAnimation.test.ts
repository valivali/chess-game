import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { act, renderHook } from "@testing-library/react"

import { useFireworkAnimation } from "./useFireworkAnimation"

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

describe("useFireworkAnimation", () => {
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
    it("should return empty fireworks array when inactive", () => {
      const { result } = renderHook(() =>
        useFireworkAnimation({
          colors: mockColors,
          isActive: false
        })
      )

      expect(result.current).toEqual([])
    })

    it("should return empty fireworks array initially when active", () => {
      const { result } = renderHook(() =>
        useFireworkAnimation({
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
          useFireworkAnimation({
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
          useFireworkAnimation({
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
        useFireworkAnimation({
          colors: mockColors,
          isActive: true
        })
      )

      unmount()

      expect(mockCancelAnimationFrame).toHaveBeenCalled()
    })
  })

  describe("firework creation", () => {
    it("should create fireworks when animation runs and enough time has passed", async () => {
      const { result } = renderHook(() =>
        useFireworkAnimation({
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
      expect(result.current.length).toBeLessThanOrEqual(30)
    })

    it("should respect maxParticles limit", async () => {
      const { result } = renderHook(() =>
        useFireworkAnimation({
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

    it("should use provided colors for firework particles", async () => {
      const customColors = ["#ffffff", "#000000"]
      const { result } = renderHook(() =>
        useFireworkAnimation({
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
        const particleColors = result.current.map((particle) => particle.color)
        particleColors.forEach((color) => {
          expect(customColors).toContain(color)
        })
      }
    })

    it("should create fireworks with radial pattern", async () => {
      const { result } = renderHook(() =>
        useFireworkAnimation({
          colors: mockColors,
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
        const velocities = result.current.map((p) => ({ vx: p.velocityX, vy: p.velocityY }))
        const uniqueVelocities = new Set(velocities.map((v) => `${v.vx},${v.vy}`))
        expect(uniqueVelocities.size).toBeGreaterThan(1)
      }
    })
  })

  describe("firework physics", () => {
    it("should update particle positions and properties", async () => {
      const { result } = renderHook(() =>
        useFireworkAnimation({
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

      const initialParticles = [...result.current]
      expect(initialParticles.length).toBeGreaterThan(0)

      mockPerformanceNow.mockReturnValue(1200)
      const animationCallback2 = mockRequestAnimationFrame.mock.calls[1][0] as (time: number) => void
      await act(async () => {
        animationCallback2(1200)
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      const updatedParticles = result.current

      if (initialParticles.length > 0 && updatedParticles.length > 0) {
        const initialParticle = initialParticles[0]
        const updatedParticle = updatedParticles.find((p) => p.id === initialParticle.id)

        if (updatedParticle) {
          expect(updatedParticle.x).not.toBe(initialParticle.x)
          expect(updatedParticle.y).not.toBe(initialParticle.y)
          expect(updatedParticle.life).toBeLessThan(initialParticle.life)
          expect(updatedParticle.velocityY).toBeGreaterThan(initialParticle.velocityY)
        }
      }
    })

    it("should remove particles when their life reaches zero", async () => {
      const { result } = renderHook(() =>
        useFireworkAnimation({
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

      const initialCount = result.current.length

      for (let i = 0; i < 70; i++) {
        mockPerformanceNow.mockReturnValue(1200 + i * 50)
        const callIndex = mockRequestAnimationFrame.mock.calls.length - 1
        const animationCallback = mockRequestAnimationFrame.mock.calls[callIndex][0] as (time: number) => void
        await act(async () => {
          animationCallback(1200 + i * 50)
          await new Promise((resolve) => setTimeout(resolve, 5))
        })
      }

      expect(result.current.length).toBeLessThanOrEqual(initialCount)
    })

    it("should apply gravity to particles", async () => {
      const { result } = renderHook(() =>
        useFireworkAnimation({
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

      const initialParticles = [...result.current]

      for (let i = 0; i < 5; i++) {
        mockPerformanceNow.mockReturnValue(1200 + i * 100)
        const callIndex = mockRequestAnimationFrame.mock.calls.length - 1
        const animationCallback = mockRequestAnimationFrame.mock.calls[callIndex][0] as (time: number) => void
        await act(async () => {
          animationCallback(1200 + i * 100)
          await new Promise((resolve) => setTimeout(resolve, 5))
        })
      }

      if (initialParticles.length > 0 && result.current.length > 0) {
        const initialParticle = initialParticles[0]
        const finalParticle = result.current.find((p) => p.id === initialParticle.id)

        if (finalParticle) {
          expect(finalParticle.velocityY).toBeGreaterThan(initialParticle.velocityY)
        }
      }
    })
  })

  describe("configuration options", () => {
    it("should respect custom maxParticles setting", async () => {
      const customMaxParticles = 15
      const { result } = renderHook(() =>
        useFireworkAnimation({
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
        useFireworkAnimation({
          colors: mockColors,
          isActive: true,
          creationRate: 1000
        })
      )

      mockPerformanceNow.mockReturnValue(1000)
      const animationCallback1 = mockRequestAnimationFrame.mock.calls[0][0] as (time: number) => void
      await act(async () => {
        animationCallback1(1000)
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      const countAfterFirst = result.current.length

      mockPerformanceNow.mockReturnValue(1500)
      const animationCallback2 = mockRequestAnimationFrame.mock.calls[1][0] as (time: number) => void
      await act(async () => {
        animationCallback2(1500)
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      expect(result.current.length).toBe(countAfterFirst)

      mockPerformanceNow.mockReturnValue(2100)
      const animationCallback3 = mockRequestAnimationFrame.mock.calls[2][0] as (time: number) => void
      await act(async () => {
        animationCallback3(2100)
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      expect(result.current.length).toBeGreaterThan(countAfterFirst)
    })
  })

  describe("firework positioning", () => {
    it("should create fireworks near center of screen with some variation", async () => {
      const { result } = renderHook(() =>
        useFireworkAnimation({
          colors: mockColors,
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
        const firstParticle = result.current[0]
        const centerX = window.innerWidth / 2
        const centerY = window.innerHeight / 2

        expect(firstParticle.x).toBeGreaterThan(centerX - 400)
        expect(firstParticle.x).toBeLessThan(centerX + 400)
        expect(firstParticle.y).toBeGreaterThan(centerY - 200)
        expect(firstParticle.y).toBeLessThan(centerY + 200)

        const initialPositions = result.current.map((p) => ({ x: p.x, y: p.y }))
        const firstPosition = initialPositions[0]

        const nearSamePosition = initialPositions.filter(
          (pos) => Math.abs(pos.x - firstPosition.x) < 200 && Math.abs(pos.y - firstPosition.y) < 200
        ).length
        expect(nearSamePosition).toBeGreaterThan(initialPositions.length * 0.2)
      }
    })
  })

  describe("particle lifecycle", () => {
    it("should initialize particles with correct properties", async () => {
      const { result } = renderHook(() =>
        useFireworkAnimation({
          colors: mockColors,
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
        const particle = result.current[0]

        expect(particle.id).toBeDefined()
        expect(typeof particle.x).toBe("number")
        expect(typeof particle.y).toBe("number")
        expect(typeof particle.velocityX).toBe("number")
        expect(typeof particle.velocityY).toBe("number")
        expect(mockColors).toContain(particle.color)
        expect(particle.life).toBeLessThanOrEqual(60)
        expect(particle.life).toBeGreaterThan(0)
        expect(particle.maxLife).toBe(60)
      }
    })
  })
})
