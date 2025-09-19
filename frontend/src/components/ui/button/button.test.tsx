import "@testing-library/jest-dom"

import { describe, expect, it, jest } from "@jest/globals"
import { fireEvent, render, screen } from "@testing-library/react"
import type { Ref } from "react"

import { Button } from "./button"

describe("Button", () => {
  it("should render with default props", () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole("button")
    expect(button).toBeDefined()
    expect(button.textContent).toBe("Click me")
    expect(button.classList.contains("button")).toBe(true)
    expect(button.classList.contains("button--default")).toBe(true)
    expect(button.classList.contains("button--default-size")).toBe(true)
  })

  it("should render with different variants", () => {
    const variants = ["default", "destructive", "outline", "secondary", "ghost", "link", "gradient", "warm"] as const

    variants.forEach((variant) => {
      const { unmount } = render(<Button variant={variant}>Button</Button>)

      const button = screen.getByRole("button")
      expect(button.classList.contains(`button--${variant}`)).toBe(true)

      unmount()
    })
  })

  it("should render with different sizes", () => {
    const sizes = ["default", "sm", "lg", "xl", "icon"] as const

    sizes.forEach((size) => {
      const { unmount } = render(<Button size={size}>Button</Button>)

      const button = screen.getByRole("button")
      const expectedClass = size === "default" ? "button--default-size" : `button--${size}`
      expect(button.classList.contains(expectedClass)).toBe(true)

      unmount()
    })
  })

  it("should handle custom className", () => {
    render(<Button className="custom-class">Button</Button>)

    const button = screen.getByRole("button")
    expect(button.classList.contains("button")).toBe(true)
    expect(button.classList.contains("button--default")).toBe(true)
    expect(button.classList.contains("button--default-size")).toBe(true)
    expect(button.classList.contains("custom-class")).toBe(true)
  })

  it("should handle onClick events", () => {
    const mockOnClick = jest.fn()
    render(<Button onClick={mockOnClick}>Click me</Button>)

    const button = screen.getByRole("button")
    fireEvent.click(button)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled Button</Button>)

    const button = screen.getByRole("button") as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })

  it("should forward other HTML button props", () => {
    render(
      <Button type="submit" data-testid="submit-button">
        Submit
      </Button>
    )

    const button = screen.getByRole("button")
    expect(button.getAttribute("type")).toBe("submit")
    expect(button.getAttribute("data-testid")).toBe("submit-button")
  })

  it("should render as child component when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )

    const link = screen.getByRole("link")
    expect(link).toBeDefined()
    expect(link.textContent).toBe("Link Button")
    expect(link.getAttribute("href")).toBe("/test")
    expect(link.classList.contains("button")).toBe(true)
    expect(link.classList.contains("button--default")).toBe(true)
    expect(link.classList.contains("button--default-size")).toBe(true)
  })

  it("should combine variant and size classes correctly", () => {
    render(
      <Button variant="outline" size="lg">
        Large Outline Button
      </Button>
    )

    const button = screen.getByRole("button")
    expect(button.classList.contains("button")).toBe(true)
    expect(button.classList.contains("button--outline")).toBe(true)
    expect(button.classList.contains("button--lg")).toBe(true)
  })

  it("should handle multiple custom classes", () => {
    render(<Button className="class1 class2">Button</Button>)

    const button = screen.getByRole("button")
    expect(button.classList.contains("button")).toBe(true)
    expect(button.classList.contains("button--default")).toBe(true)
    expect(button.classList.contains("button--default-size")).toBe(true)
    expect(button.classList.contains("class1")).toBe(true)
    expect(button.classList.contains("class2")).toBe(true)
  })

  it("should forward ref correctly", () => {
    const ref = jest.fn() as Ref<HTMLButtonElement>
    render(<Button ref={ref}>Button</Button>)

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement))
    const button = screen.getByRole("button")
    expect(button.classList.contains("button")).toBe(true)
    expect(button.classList.contains("button--default")).toBe(true)
    expect(button.classList.contains("button--default-size")).toBe(true)
  })

  it("should handle all combinations of props", () => {
    const mockOnClick = jest.fn()

    render(
      <Button variant="gradient" size="xl" className="test-class" onClick={mockOnClick} disabled={false} type="button">
        Complex Button
      </Button>
    )

    const button = screen.getByRole("button")

    expect(button.classList.contains("button")).toBe(true)
    expect(button.classList.contains("button--gradient")).toBe(true)
    expect(button.classList.contains("button--xl")).toBe(true)
    expect(button.classList.contains("test-class")).toBe(true)
    expect(button.getAttribute("type")).toBe("button")
    expect(button.classList.contains("button--disabled")).toBe(false)

    fireEvent.click(button)
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it("should filter out falsy class names", () => {
    render(<Button className="">Button</Button>)

    const button = screen.getByRole("button")
    // Should still have the base classes even with empty className
    expect(button.classList.contains("button")).toBe(true)
    expect(button.classList.contains("button--default")).toBe(true)
    expect(button.classList.contains("button--default-size")).toBe(true)
  })
})
