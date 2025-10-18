import "./pagination.scss"

import * as React from "react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, isLoading = false }) => {
  if (totalPages <= 1) {
    return null
  }

  const handlePrevious = () => {
    if (currentPage > 1 && !isLoading) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages && !isLoading) {
      onPageChange(currentPage + 1)
    }
  }

  const handlePageClick = (page: number) => {
    if (page !== currentPage && !isLoading) {
      onPageChange(page)
    }
  }

  const getVisiblePages = (): number[] => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, -1) // -1 represents dots
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push(-1, totalPages) // -1 represents dots
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="pagination">
      <button
        className={`pagination__button pagination__button--prev ${currentPage === 1 || isLoading ? "pagination__button--disabled" : ""}`}
        onClick={handlePrevious}
        disabled={currentPage === 1 || isLoading}
        aria-label="Previous page"
      >
        ←
      </button>

      {visiblePages.map((page, index) => {
        if (page === -1) {
          return (
            <span key={`dots-${index}`} className="pagination__dots">
              ...
            </span>
          )
        }

        return (
          <button
            key={page}
            className={`pagination__button ${page === currentPage ? "pagination__button--active" : ""} ${isLoading ? "pagination__button--disabled" : ""}`}
            onClick={() => handlePageClick(page)}
            disabled={isLoading}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        )
      })}

      <button
        className={`pagination__button pagination__button--next ${currentPage === totalPages || isLoading ? "pagination__button--disabled" : ""}`}
        onClick={handleNext}
        disabled={currentPage === totalPages || isLoading}
        aria-label="Next page"
      >
        →
      </button>
    </div>
  )
}

export { Pagination }
