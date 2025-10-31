import { OpeningProgress } from "@/types/opening-types"

export interface ProgressServiceInterface {
  /**
   * Get progress for a specific position
   */
  getProgress(userId: string, repertoireId: string, nodeId: string): Promise<OpeningProgress | null>

  /**
   * Update progress after a training attempt
   */
  updateProgress(userId: string, repertoireId: string, nodeId: string, wasCorrect: boolean): Promise<OpeningProgress>

  /**
   * Get all progress for a user's repertoire
   */
  getRepertoireProgress(userId: string, repertoireId: string): Promise<OpeningProgress[]>

  /**
   * Get positions due for review
   */
  getPositionsDueForReview(userId: string, repertoireId?: string): Promise<OpeningProgress[]>

  /**
   * Reset progress for a position
   */
  resetProgress(userId: string, repertoireId: string, nodeId: string): Promise<OpeningProgress>

  /**
   * Get user's overall training statistics
   */
  getUserStats(userId: string): Promise<{
    totalPositions: number
    positionsLearned: number
    averageEaseFactor: number
    longestStreak: number
    positionsDueToday: number
  }>
}
