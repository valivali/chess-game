import "./OpeningCard.scss"

import React from "react"
import { match } from "ts-pattern"

import type { PopularOpening } from "../../api/popularOpenings.api"
import type { OpeningDifficulty } from "../../types/opening.types"
import { OPENING_DIFFICULTY, WHITE_OPENING_MOVE } from "../../types/opening.types"

interface OpeningCardProps {
  opening: PopularOpening
  onSelect: (opening: PopularOpening) => void
  isSelected?: boolean
}

export const OpeningCard: React.FC<OpeningCardProps> = ({ opening, onSelect, isSelected = false }) => {
  const getDifficultyColor = (difficulty: OpeningDifficulty): string =>
    match(difficulty)
      .with(OPENING_DIFFICULTY.BEGINNER, () => "var(--color-emerald-500)")
      .with(OPENING_DIFFICULTY.INTERMEDIATE, () => "var(--color-amber-500)")
      .with(OPENING_DIFFICULTY.ADVANCED, () => "var(--color-red-500)")
      .exhaustive()

  const getColorIcon = (san: string): string => {
    const whiteOpeningMoves = Object.values(WHITE_OPENING_MOVE) as string[]
    if (whiteOpeningMoves.includes(san)) {
      return "♔"
    }
    return "♚"
  }

  return (
    <div
      className={`opening-card ${isSelected ? "opening-card--selected" : ""} ${opening.isPopular ? "opening-card--popular" : ""}`}
      onClick={() => onSelect(opening)}
    >
      <div className="opening-card__header">
        <h3 className="opening-card__name">{opening.name}</h3>
        {opening.isPopular && <span className="opening-card__popular-badge">Popular</span>}
      </div>

      <div className="opening-card__meta">
        <span className="opening-card__color" title={`First move: ${opening.san}`}>
          {getColorIcon(opening.san)}
        </span>
        <span className="opening-card__difficulty" style={{ color: getDifficultyColor(opening.difficulty) }}>
          {opening.difficulty}
        </span>
        <span className="opening-card__eco">{opening.eco}</span>
        <span className="opening-card__rating">Avg: {Math.round(opening.averageRating)}</span>
      </div>

      <div className="opening-card__move">
        <h4>First move:</h4>
        <span className="opening-card__san">{opening.san}</span>
        <span className="opening-card__uci">({opening.uci})</span>
      </div>

      <div className="opening-card__stats">
        <h4>Master games:</h4>
        <div className="opening-card__stats-grid">
          <div className="stat">
            <span className="stat-label">Total</span>
            <span className="stat-value">{opening.stats.total.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="stat-label">White</span>
            <span className="stat-value">{opening.stats.whiteWinRate.toFixed(1)}%</span>
          </div>
          <div className="stat">
            <span className="stat-label">Draw</span>
            <span className="stat-value">{opening.stats.drawRate.toFixed(1)}%</span>
          </div>
          <div className="stat">
            <span className="stat-label">Black</span>
            <span className="stat-value">{opening.stats.blackWinRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OpeningCard
