import "./EmptyState.scss"

import * as React from "react"

import { Button } from "../button"

interface EmptyStateProps {
  title: string
  description: string
  motivationText?: string
  actionLabel: string
  onAction: () => void
  isLoading?: boolean
  icon?: React.ReactNode
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, motivationText, actionLabel, onAction, isLoading = false, icon }) => {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state__icon">{icon}</div>}

      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__description">{description}</p>

      {motivationText && <p className="empty-state__motivation">{motivationText}</p>}

      <Button variant="gradient" size="lg" onClick={onAction} disabled={isLoading} className="empty-state__action">
        {isLoading ? "Loading..." : actionLabel}
      </Button>
    </div>
  )
}

export { EmptyState }
