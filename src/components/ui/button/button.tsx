import "./button.scss"

import { Slot } from "@radix-ui/react-slot"
import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient" | "warm"
  size?: "default" | "sm" | "lg" | "xl" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const sizeClass = size === "default" ? "default-size" : size
    const buttonClasses = ["button", `button--${variant}`, `button--${sizeClass}`, className].filter(Boolean).join(" ")

    return <Comp className={buttonClasses} ref={ref} {...props} />
  }
)
Button.displayName = "Button"

export { Button }
