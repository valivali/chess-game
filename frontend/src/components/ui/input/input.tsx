import "./input.scss"

import * as React from "react"

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = "default", size = "default", type = "text", ...props }, ref) => {
    const sizeClass = size === "default" ? "default-size" : size
    const inputClasses = ["input", `input--${variant}`, `input--${sizeClass}`, className].filter(Boolean).join(" ")

    return <input type={type} className={inputClasses} ref={ref} {...props} />
  }
)
Input.displayName = "Input"

export { Input }
