import "./badge.scss"

import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "secondary"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = "default", size = "md", children, ...props }, ref) => {
  const badgeClasses = ["badge", `badge--${variant}`, `badge--${size}`, className].filter(Boolean).join(" ")

  return (
    <span ref={ref} className={badgeClasses} {...props}>
      {children}
    </span>
  )
})
Badge.displayName = "Badge"

export { Badge }
