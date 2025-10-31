import { MoveTrainingResult, OpeningMove, TrainingSession } from "@/types/opening-types"

export interface TrainingServiceInterface {
  /**
   * Start a new training session
   */
  startSession(
    userId: string,
    repertoireId: string,
    mode: TrainingSession["mode"],
    settings?: Partial<TrainingSession["settings"]>
  ): Promise<TrainingSession>

  /**
   * Get an active training session
   */
  getSession(sessionId: string, userId: string): Promise<TrainingSession | null>

  /**
   * Make a move in a training session
   */
  makeMove(sessionId: string, move: OpeningMove, userId: string): Promise<MoveTrainingResult>

  /**
   * End a training session
   */
  endSession(sessionId: string, userId: string): Promise<TrainingSession>

  /**
   * Pause a training session
   */
  pauseSession(sessionId: string, userId: string): Promise<TrainingSession>

  /**
   * Resume a paused training session
   */
  resumeSession(sessionId: string, userId: string): Promise<TrainingSession>

  /**
   * Take back the last move (if allowed)
   */
  takeBack(sessionId: string, userId: string): Promise<TrainingSession>

  /**
   * Reset session to starting position
   */
  resetPosition(sessionId: string, userId: string): Promise<TrainingSession>

  /**
   * Get user's training sessions
   */
  getUserSessions(userId: string, status?: TrainingSession["status"]): Promise<TrainingSession[]>

  /**
   * Update session settings
   */
  updateSessionSettings(sessionId: string, settings: Partial<TrainingSession["settings"]>, userId: string): Promise<TrainingSession>
}
