import { describe, expect, it, jest } from "@jest/globals"
import { render, screen } from "@testing-library/react"
import type { Ref } from "react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card"

describe("Card Components", () => {
  describe("Card", () => {
    it("should render with default classes", () => {
      render(<Card>Card content</Card>)

      const card = screen.getByText("Card content")
      expect(card).toBeDefined()
      expect(card.classList.contains("card")).toBe(true)
    })

    it("should render with custom className", () => {
      render(<Card className="custom-card">Card content</Card>)

      const card = screen.getByText("Card content")
      expect(card).toBeDefined()
      expect(card.classList.contains("card")).toBe(true)
      expect(card.classList.contains("custom-card")).toBe(true)
    })

    it("should forward HTML attributes", () => {
      render(
        <Card data-testid="test-card" id="card-id">
          Card content
        </Card>
      )

      const card = screen.getByTestId("test-card")
      expect(card).toBeDefined()
      expect(card.getAttribute("id")).toBe("card-id")
    })

    it("should forward ref correctly", () => {
      const ref = jest.fn() as Ref<HTMLDivElement>
      render(<Card ref={ref}>Card content</Card>)

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
    })
  })

  describe("CardHeader", () => {
    it("should render with correct classes", () => {
      render(<CardHeader>Header content</CardHeader>)

      const header = screen.getByText("Header content")
      expect(header).toBeDefined()
      expect(header.classList.contains("card__header")).toBe(true)
    })

    it("should render with custom className", () => {
      render(<CardHeader className="custom-header">Header content</CardHeader>)

      const header = screen.getByText("Header content")
      expect(header).toBeDefined()
      expect(header.classList.contains("card__header")).toBe(true)
      expect(header.classList.contains("custom-header")).toBe(true)
    })

    it("should forward ref correctly", () => {
      const ref = jest.fn() as Ref<HTMLDivElement>
      render(<CardHeader ref={ref}>Header content</CardHeader>)

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
    })
  })

  describe("CardTitle", () => {
    it("should render as h3 with correct classes", () => {
      render(<CardTitle>Title content</CardTitle>)

      const title = screen.getByRole("heading", { level: 3 })
      expect(title).toBeDefined()
      expect(title.textContent).toBe("Title content")
      expect(title.classList.contains("card__title")).toBe(true)
    })

    it("should render with custom className", () => {
      render(<CardTitle className="custom-title">Title content</CardTitle>)

      const title = screen.getByRole("heading", { level: 3 })
      expect(title).toBeDefined()
      expect(title.classList.contains("card__title")).toBe(true)
      expect(title.classList.contains("custom-title")).toBe(true)
    })

    it("should forward ref correctly", () => {
      const ref = jest.fn() as Ref<HTMLParagraphElement>
      render(<CardTitle ref={ref}>Title content</CardTitle>)

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLHeadingElement))
    })
  })

  describe("CardDescription", () => {
    it("should render as paragraph with correct classes", () => {
      render(<CardDescription>Description content</CardDescription>)

      const description = screen.getByText("Description content")
      expect(description).toBeDefined()
      expect(description.tagName).toBe("P")
      expect(description.classList.contains("card__description")).toBe(true)
    })

    it("should render with custom className", () => {
      render(<CardDescription className="custom-description">Description content</CardDescription>)

      const description = screen.getByText("Description content")
      expect(description).toBeDefined()
      expect(description.classList.contains("card__description")).toBe(true)
      expect(description.classList.contains("custom-description")).toBe(true)
    })

    it("should forward ref correctly", () => {
      const ref = jest.fn() as Ref<HTMLParagraphElement>
      render(<CardDescription ref={ref}>Description content</CardDescription>)

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLParagraphElement))
    })
  })

  describe("CardContent", () => {
    it("should render with correct classes", () => {
      render(<CardContent>Content</CardContent>)

      const content = screen.getByText("Content")
      expect(content).toBeDefined()
      expect(content.classList.contains("card__content")).toBe(true)
    })

    it("should render with custom className", () => {
      render(<CardContent className="custom-content">Content</CardContent>)

      const content = screen.getByText("Content")
      expect(content).toBeDefined()
      expect(content.classList.contains("card__content")).toBe(true)
      expect(content.classList.contains("custom-content")).toBe(true)
    })

    it("should forward ref correctly", () => {
      const ref = jest.fn() as Ref<HTMLDivElement>
      render(<CardContent ref={ref}>Content</CardContent>)

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
    })
  })

  describe("CardFooter", () => {
    it("should render with correct classes", () => {
      render(<CardFooter>Footer content</CardFooter>)

      const footer = screen.getByText("Footer content")
      expect(footer).toBeDefined()
      expect(footer.classList.contains("card__footer")).toBe(true)
    })

    it("should render with custom className", () => {
      render(<CardFooter className="custom-footer">Footer content</CardFooter>)

      const footer = screen.getByText("Footer content")
      expect(footer).toBeDefined()
      expect(footer.classList.contains("card__footer")).toBe(true)
      expect(footer.classList.contains("custom-footer")).toBe(true)
    })

    it("should forward ref correctly", () => {
      const ref = jest.fn() as Ref<HTMLDivElement>
      render(<CardFooter ref={ref}>Footer content</CardFooter>)

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
    })
  })

  describe("Card Composition", () => {
    it("should render complete card structure", () => {
      render(
        <Card className="test-card">
          <CardHeader className="test-header">
            <CardTitle className="test-title">Test Title</CardTitle>
            <CardDescription className="test-description">Test Description</CardDescription>
          </CardHeader>
          <CardContent className="test-content">Test Content</CardContent>
          <CardFooter className="test-footer">Test Footer</CardFooter>
        </Card>
      )

      // Check all components are rendered
      expect(screen.getByText("Test Title")).toBeDefined()
      expect(screen.getByText("Test Description")).toBeDefined()
      expect(screen.getByText("Test Content")).toBeDefined()
      expect(screen.getByText("Test Footer")).toBeDefined()

      // Check structure and classes
      const card = document.querySelector(".card.test-card") as HTMLDivElement | null
      const header = document.querySelector(".card__header.test-header") as HTMLDivElement | null
      const title = document.querySelector(".card__title.test-title") as HTMLHeadingElement | null
      const description = document.querySelector(".card__description.test-description") as HTMLParagraphElement | null
      const content = document.querySelector(".card__content.test-content") as HTMLDivElement | null
      const footer = document.querySelector(".card__footer.test-footer") as HTMLDivElement | null

      expect(card).toBeDefined()
      expect(header).toBeDefined()
      expect(title).toBeDefined()
      expect(description).toBeDefined()
      expect(content).toBeDefined()
      expect(footer).toBeDefined()
    })

    it("should handle empty className gracefully", () => {
      render(
        <Card className="">
          <CardHeader className="">
            <CardTitle className="">Title</CardTitle>
          </CardHeader>
        </Card>
      )

      const card = document.querySelector(".card") as HTMLDivElement | null
      const header = document.querySelector(".card__header") as HTMLDivElement | null
      const title = document.querySelector(".card__title") as HTMLHeadingElement | null

      expect(card).not.toBeNull()
      expect(card?.classList.contains("card")).toBe(true)
      expect(header).not.toBeNull()
      expect(header?.classList.contains("card__header")).toBe(true)
      expect(title).not.toBeNull()
      expect(title?.classList.contains("card__title")).toBe(true)
    })

    it("should handle undefined className gracefully", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>
      )

      const card = document.querySelector(".card") as HTMLDivElement | null
      const header = document.querySelector(".card__header") as HTMLDivElement | null
      const title = document.querySelector(".card__title") as HTMLHeadingElement | null

      expect(card).not.toBeNull()
      expect(card?.classList.contains("card")).toBe(true)
      expect(header).not.toBeNull()
      expect(header?.classList.contains("card__header")).toBe(true)
      expect(title).not.toBeNull()
      expect(title?.classList.contains("card__title")).toBe(true)
    })
  })
})
