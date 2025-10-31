import "./OpeningTrainer.scss"

import React, { useMemo, useState } from "react"

import type { PopularOpening } from "../../api/popularOpenings.api"
import { useAllOpeningsWithFilters, useSearchOpenings } from "../../api/queries/usePopularOpeningsQueries"
import { OpeningCard } from "../OpeningCard"

interface OpeningTrainerProps {
  initialOpeningId?: string
}

export const OpeningTrainer: React.FC<OpeningTrainerProps> = ({ initialOpeningId: _initialOpeningId }) => {
  const [selectedOpening, setSelectedOpening] = useState<PopularOpening | null>(null)
  const [filter, setFilter] = useState<"all" | "popular" | "beginner" | "intermediate" | "advanced" | "white" | "black">("popular")
  const [feedback, setFeedback] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")

  const { data: openingsData, isLoading, error, filterOpenings } = useAllOpeningsWithFilters()

  const { data: searchResults, isLoading: isSearching } = useSearchOpenings(
    searchQuery,
    { limit: 20 },
    searchQuery.length >= 2 // Only search when query is at least 2 characters
  )

  const filteredOpenings = useMemo(() => {
    if (searchQuery.length >= 2 && searchResults?.data) {
      return searchResults.data
    }

    if (openingsData?.data) {
      return filterOpenings(openingsData.data, filter)
    }

    return []
  }, [openingsData?.data, filter, searchQuery, searchResults?.data, filterOpenings])

  const handleOpeningSelect = (opening: PopularOpening) => {
    setSelectedOpening(opening)
    setFeedback("")
  }

  const handleStartTraining = async (_mode: "practice" | "test" | "review") => {
    if (!selectedOpening) {
      setFeedback("Please select an opening first")
      return
    }

    try {
      setFeedback("Looking for repertoires for this opening...")

      // Step 1: Look for existing repertoires that match this opening
      // This could search by tags, name, or ECO code
      const matchingRepertoires = await findRepertoiresForOpening(selectedOpening)

      if (matchingRepertoires.length > 0) {
        // Step 2: Use existing repertoire system for training
        setFeedback(`Found ${matchingRepertoires.length} repertoire(s). Starting training...`)

        // Here we would integrate with the existing useOpeningTrainer hook
        // to start a session with the found repertoire
      } else {
        // Step 3: Create a basic repertoire from the opening data
        setFeedback("Creating training session from opening moves...")

        // Convert the opening's basic moves into a simple repertoire structure
        // for training purposes
        createBasicRepertoireFromOpening(selectedOpening)

        // Start training with this basic repertoire
      }
    } catch (error) {
      setFeedback(`Failed to start training: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  // Helper function to find repertoires matching an opening
  const findRepertoiresForOpening = async (_opening: PopularOpening) => {
    // This would call the backend to search for repertoires by:
    // - ECO code (opening.eco)
    // - Tags containing opening name
    // - Public repertoires matching the opening

    // For now, return empty array - this needs backend integration
    return []
  }

  // Helper function to create a basic repertoire from opening data
  const createBasicRepertoireFromOpening = (opening: PopularOpening) => {
    // Convert the opening's move data into a basic repertoire structure
    // This would create a simple linear tree of moves for training

    // For now, just show feedback - this needs implementation
    setFeedback(`Would create basic repertoire for ${opening.name} (${opening.san})`)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="opening-trainer">
        <div className="opening-trainer__loading">
          <h2>Loading popular openings...</h2>
          <p>Fetching data from Lichess Masters database</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="opening-trainer">
        <div className="opening-trainer__error">
          <h2>Failed to load openings</h2>
          <p>Unable to fetch opening data from the server</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="opening-trainer">
      <div className="opening-trainer__header">
        <h1>Chess Opening Trainer</h1>
        <p>Learn and practice popular chess openings</p>
        {feedback && <div className="opening-trainer__feedback">{feedback}</div>}
      </div>

      <div className="opening-trainer__search">
        <h3>Search Openings</h3>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name, ECO code, or move (e.g., 'Sicilian', 'B20', 'e4')..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchQuery && (
            <button onClick={clearSearch} className="clear-search">
              ✕
            </button>
          )}
          {isSearching && <div className="search-loading">Searching...</div>}
        </div>
      </div>

      <div className="opening-trainer__filters">
        <h3>Filter Openings</h3>
        <div className="filter-buttons">
          <button className={filter === "popular" ? "active" : ""} onClick={() => setFilter("popular")}>
            Popular
          </button>
          <button className={filter === "beginner" ? "active" : ""} onClick={() => setFilter("beginner")}>
            Beginner
          </button>
          <button className={filter === "intermediate" ? "active" : ""} onClick={() => setFilter("intermediate")}>
            Intermediate
          </button>
          <button className={filter === "advanced" ? "active" : ""} onClick={() => setFilter("advanced")}>
            Advanced
          </button>
          <button className={filter === "white" ? "active" : ""} onClick={() => setFilter("white")}>
            White Openings
          </button>
          <button className={filter === "black" ? "active" : ""} onClick={() => setFilter("black")}>
            Black Defenses
          </button>
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
            All Openings
          </button>
        </div>
      </div>

      <div className="opening-trainer__grid">
        <h3>
          {searchQuery.length >= 2 ? (
            <>
              Search Results for "{searchQuery}" ({filteredOpenings.length})
            </>
          ) : (
            <>
              {filter === "all"
                ? "All Openings"
                : filter === "popular"
                  ? "Popular Openings"
                  : filter === "white"
                    ? "White Openings"
                    : filter === "black"
                      ? "Black Defenses"
                      : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Openings`}
              ({filteredOpenings.length})
            </>
          )}
        </h3>

        <div className="openings-grid">
          {filteredOpenings.map((opening) => (
            <OpeningCard
              key={`${opening.eco}-${opening.san}`}
              opening={opening}
              onSelect={handleOpeningSelect}
              isSelected={selectedOpening?.eco === opening.eco && selectedOpening?.san === opening.san}
            />
          ))}
        </div>
      </div>

      {selectedOpening && (
        <div className="opening-trainer__controls">
          <h3>Train: {selectedOpening.name}</h3>
          <p>Ready to practice this opening? Choose your training mode:</p>
          <div className="training-modes">
            <button onClick={() => handleStartTraining("practice")}>
              Practice Mode
              <span>Learn the moves step by step</span>
            </button>
            <button onClick={() => handleStartTraining("test")}>
              Test Mode
              <span>Test your knowledge</span>
            </button>
            <button onClick={() => handleStartTraining("review")}>
              Review Mode
              <span>Study key positions</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default OpeningTrainer
