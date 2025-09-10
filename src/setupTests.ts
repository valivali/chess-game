import "@testing-library/jest-dom"

import { jest } from "@jest/globals"

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveClass(...classes: string[]): R
    }
  }
}

// Polyfills for jsdom
import { TextEncoder } from "util"
global.TextEncoder = TextEncoder

// Only polyfill TextDecoder if not present, and use a compatible implementation
if (typeof global.TextDecoder === "undefined") {
  const { TextDecoder } = require("util")
  global.TextDecoder = TextDecoder as typeof global.TextDecoder
}

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

// Mock DragEvent for jsdom
interface EventInit {
  bubbles?: boolean
  cancelable?: boolean
  composed?: boolean
}

interface MouseEventInit extends EventInit {
  screenX?: number
  screenY?: number
  clientX?: number
  clientY?: number
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  button?: number
  buttons?: number
  relatedTarget?: EventTarget | null
}

interface DragEventInit extends MouseEventInit {
  dataTransfer?: DataTransfer | null
}

global.DragEvent = class DragEvent extends Event {
  constructor(type: string, eventInitDict?: DragEventInit) {
    super(type, eventInitDict)
    this.dataTransfer = eventInitDict?.dataTransfer || null
  }
  dataTransfer: DataTransfer | null
} as any
