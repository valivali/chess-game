import { ProgressServiceInterface } from "./progressService.interface"
import { OpeningProgress } from "@/types/opening-types"
import { OpeningProgressModel } from "@/models"

export class ProgressService implements ProgressServiceInterface {
  constructor() {}

  async getProgress(userId: string, repertoireId: string, nodeId: string): Promise<OpeningProgress | null> {
    const progress = await OpeningProgressModel.findOne({
      userId,
      repertoireId,
      nodeId
    }).exec()

    return progress ? (progress.toJSON() as OpeningProgress) : null
  }

  async updateProgress(userId: string, repertoireId: string, nodeId: string, wasCorrect: boolean): Promise<OpeningProgress> {
    let progress = await this.getProgress(userId, repertoireId, nodeId)

    if (!progress) {
      // Create new progress record
      progress = {
        userId,
        repertoireId,
        nodeId,
        timesReviewed: 0,
        timesCorrect: 0,
        easeFactor: 2.5,
        nextReview: new Date(),
        interval: 1,
        lastReview: new Date(),
        streak: 0
      }
    }

    // Update review statistics
    progress.timesReviewed += 1
    progress.lastReview = new Date()

    if (wasCorrect) {
      progress.timesCorrect += 1
      progress.streak += 1

      // Apply spaced repetition algorithm (SM-2)
      progress = this.applySpacedRepetition(progress, true)
    } else {
      progress.streak = 0

      // Reset interval for incorrect answers
      progress = this.applySpacedRepetition(progress, false)
    }

    // Save or update the progress
    const updatedProgress = await OpeningProgressModel.findOneAndUpdate({ userId, repertoireId, nodeId }, progress, {
      upsert: true,
      new: true
    }).exec()

    return updatedProgress.toJSON() as OpeningProgress
  }

  async getRepertoireProgress(userId: string, repertoireId: string): Promise<OpeningProgress[]> {
    const progressRecords = await OpeningProgressModel.find({
      userId,
      repertoireId
    })
      .sort({ lastReview: -1 })
      .exec()

    return progressRecords.map((record) => record.toJSON() as OpeningProgress)
  }

  async getPositionsDueForReview(userId: string, repertoireId?: string): Promise<OpeningProgress[]> {
    const query: any = {
      userId,
      nextReview: { $lte: new Date() }
    }

    if (repertoireId) {
      query.repertoireId = repertoireId
    }

    const duePositions = await OpeningProgressModel.find(query).sort({ nextReview: 1 }).exec()

    return duePositions.map((position) => position.toJSON() as OpeningProgress)
  }

  async resetProgress(userId: string, repertoireId: string, nodeId: string): Promise<OpeningProgress> {
    const resetProgress: Partial<OpeningProgress> = {
      timesReviewed: 0,
      timesCorrect: 0,
      easeFactor: 2.5,
      nextReview: new Date(),
      interval: 1,
      lastReview: new Date(),
      streak: 0
    }

    const updatedProgress = await OpeningProgressModel.findOneAndUpdate({ userId, repertoireId, nodeId }, resetProgress, {
      upsert: true,
      new: true
    }).exec()

    return updatedProgress.toJSON() as OpeningProgress
  }

  async getUserStats(userId: string): Promise<{
    totalPositions: number
    positionsLearned: number
    averageEaseFactor: number
    longestStreak: number
    positionsDueToday: number
  }> {
    const [totalPositions, positionsLearned, averageStats, longestStreak, positionsDueToday] = await Promise.all([
      // Total positions tracked
      OpeningProgressModel.countDocuments({ userId }),

      // Positions learned (streak >= 3 or ease factor >= 2.5)
      OpeningProgressModel.countDocuments({
        userId,
        $or: [{ streak: { $gte: 3 } }, { easeFactor: { $gte: 2.5 } }]
      }),

      // Average ease factor
      OpeningProgressModel.aggregate([{ $match: { userId } }, { $group: { _id: null, avgEaseFactor: { $avg: "$easeFactor" } } }]),

      // Longest streak
      OpeningProgressModel.aggregate([{ $match: { userId } }, { $group: { _id: null, maxStreak: { $max: "$streak" } } }]),

      // Positions due today
      OpeningProgressModel.countDocuments({
        userId,
        nextReview: { $lte: new Date() }
      })
    ])

    return {
      totalPositions,
      positionsLearned,
      averageEaseFactor: averageStats[0]?.avgEaseFactor || 2.5,
      longestStreak: longestStreak[0]?.maxStreak || 0,
      positionsDueToday
    }
  }

  // Private helper methods

  private applySpacedRepetition(progress: OpeningProgress, wasCorrect: boolean): OpeningProgress {
    if (wasCorrect) {
      // Increase interval based on ease factor
      if (progress.timesReviewed === 1) {
        progress.interval = 1
      } else if (progress.timesReviewed === 2) {
        progress.interval = 6
      } else {
        progress.interval = Math.round(progress.interval * progress.easeFactor)
      }

      // Adjust ease factor based on performance
      progress.easeFactor = Math.max(1.3, progress.easeFactor + (0.1 - (5 - 4) * (0.08 + (5 - 4) * 0.02)))
    } else {
      // Reset interval for incorrect answers
      progress.interval = 1

      // Decrease ease factor for incorrect answers
      progress.easeFactor = Math.max(1.3, progress.easeFactor - 0.2)
    }

    // Set next review date
    const nextReviewDate = new Date()
    nextReviewDate.setDate(nextReviewDate.getDate() + progress.interval)
    progress.nextReview = nextReviewDate

    return progress
  }

  static build(): ProgressService {
    return new ProgressService()
  }
}
