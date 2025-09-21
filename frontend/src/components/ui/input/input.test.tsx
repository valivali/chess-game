import "@testing-library/jest-dom"

import { describe, expect, it } from "@jest/globals"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Input } from "./input"

describe("Input", () => {
  it("should render with default props", () => {
    render(<Input placeholder="Test input" />)

    const input = screen.getByPlaceholderText("Test input")
    expect(input).toBeDefined()
    expect(input.classList.contains("input")).toBe(true)
    expect(input.classList.contains("input--default")).toBe(true)
    expect(input.classList.contains("input--default-size")).toBe(true)
  })

  it("should render with different variants", () => {
    const variants = ["default", "outline"] as const

    variants.forEach((variant) => {
      const { unmount } = render(<Input variant={variant} placeholder={`${variant} input`} />)

      const input = screen.getByPlaceholderText(`${variant} input`)
      expect(input.classList.contains(`input--${variant}`)).toBe(true)

      unmount()
    })
  })

  it("should render with different sizes", () => {
    const sizes = ["default", "sm", "lg"] as const

    sizes.forEach((size) => {
      const { unmount } = render(<Input size={size} placeholder={`${size} input`} />)

      const input = screen.getByPlaceholderText(`${size} input`)
      const expectedClass = size === "default" ? "input--default-size" : `input--${size}`
      expect(input.classList.contains(expectedClass)).toBe(true)

      unmount()
    })
  })

  it("should handle custom className", () => {
    render(<Input className="custom-class" placeholder="Custom input" />)

    const input = screen.getByPlaceholderText("Custom input")
    expect(input.classList.contains("input")).toBe(true)
    expect(input.classList.contains("input--default")).toBe(true)
    expect(input.classList.contains("input--default-size")).toBe(true)
    expect(input.classList.contains("custom-class")).toBe(true)
  })

  it("should handle value changes", async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Type here" />)

    const input = screen.getByPlaceholderText("Type here") as HTMLInputElement

    await user.type(input, "Hello World")
    expect(input.value).toBe("Hello World")
  })

  it("should be disabled when disabled prop is true", () => {
    render(<Input disabled placeholder="Disabled input" />)

    const input = screen.getByPlaceholderText("Disabled input") as HTMLInputElement
    expect(input.disabled).toBe(true)
  })

  it("should accept maxLength prop", () => {
    render(<Input maxLength={10} placeholder="Max length input" />)

    const input = screen.getByPlaceholderText("Max length input")
    expect(input.getAttribute("maxLength")).toBe("10")
  })
})
