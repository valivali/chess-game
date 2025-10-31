import { Request, Response } from "express"
import { OpeningServiceInterface } from "@/services/opening/openingService.interface"
import { TrainingServiceInterface } from "@/services/opening/trainingService.interface"
import { ProgressServiceInterface } from "@/services/opening/progressService.interface"
import { OpeningService } from "@/services/opening/OpeningService"
import { TrainingService } from "@/services/opening/TrainingService"
import { ProgressService } from "@/services/opening/ProgressService"

import {
  CreateRepertoireRequestDto,
  PositionsDueQueryDto,
  PublicRepertoiresQueryDto,
  RepertoireAndNodeIdParamDto,
  RepertoireIdParamDto,
  SessionIdParamDto,
  UpdateRepertoireRequestDto,
  UserSessionsQueryDto
} from "@/validation/schemas"

export class OpeningController {
  constructor(
    private readonly openingService: OpeningServiceInterface,
    private readonly trainingService: TrainingServiceInterface,
    private readonly progressService: ProgressServiceInterface
  ) {}

  async createRepertoire(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "Authentication required" })
        return
      }

      const repertoireData = req.body as CreateRepertoireRequestDto
      const repertoireWithUserId = {
        ...repertoireData,
        userId
      }

      const repertoire = await this.openingService.createRepertoire(repertoireWithUserId)
      res.status(201).json({ repertoire })
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to create repertoire"
      })
    }
  }

  async getUserRepertoires(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "Authentication required" })
        return
      }

      const repertoires = await this.openingService.getUserRepertoires(userId)
      res.json({ repertoires })
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch repertoires"
      })
    }
  }

  async getRepertoire(req: Request, res: Response): Promise<void> {
    try {
      const { repertoireId } = req.params as RepertoireIdParamDto
      const userId = req.user?.userId

      const repertoire = await this.openingService.getRepertoire(repertoireId, userId)

      if (!repertoire) {
        res.status(404).json({ error: "Repertoire not found" })
        return
      }

      res.json({ repertoire })
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch repertoire"
      })
    }
  }

  async updateRepertoire(req: Request, res: Response): Promise<void> {
    try {
      const { repertoireId } = req.params as RepertoireIdParamDto
      const userId = req.user?.userId

      if (!userId) {
        res.status(401).json({ error: "Authentication required" })
        return
      }

      const updateData = req.body as UpdateRepertoireRequestDto
      const repertoire = await this.openingService.updateRepertoire(repertoireId, updateData, userId)
      res.json({ repertoire })
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to update repertoire"
      })
    }
  }

  async deleteRepertoire(req: Request, res: Response): Promise<void> {
    try {
      const { repertoireId } = req.params as RepertoireIdParamDto
      const userId = req.user?.userId

      if (!userId) {
        res.status(401).json({ error: "Authentication required" })
        return
      }

      const success = await this.openingService.deleteRepertoire(repertoireId, userId)

      if (!success) {
        res.status(404).json({ error: "Repertoire not found" })
        return
      }

      res.status(204).send()
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to delete repertoire"
      })
    }
  }

  async importFromPgn(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "Authentication required" })
        return
      }

      const { pgn, name, description, color } = req.body

      if (!pgn || !name || !color) {
        res.status(400).json({ error: "PGN, name, and color are required" })
        return
      }

      const result = await this.openingService.importFromPgn(pgn, name, userId, color, description)
      res.json({ result })
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to import PGN"
      })
    }
  }

  async getPublicRepertoires(req: Request, res: Response): Promise<void> {
    try {
      const { tags, limit, offset } = req.query as unknown as PublicRepertoiresQueryDto

      const repertoires = await this.openingService.getPublicRepertoires(tags, limit, offset)
      res.json({ repertoires })
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch public repertoires"
      })
    }
  }

  // Training session endpoints

  async startTrainingSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "Authentication required" })
        return
      }

      const { repertoireId, mode, settings } = req.body

      if (!repertoireId || !mode) {
        res.status(400).json({ error: "Repertoire ID and mode are required" })
        return
      }

      const session = await this.trainingService.startSession(userId, repertoireId, mode, settings)
      res.status(201).json({ session })
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to start training session"
      })
    }
  }

  async getTrainingSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params as SessionIdParamDto
      const userId = req.user?.userId

      if (!userId) {
        res.status(401).json({ error: "Authentication required" })
        return
      }

      const session = await this.trainingService.getSession(sessionId, userId)

      if (!session) {
        res.status(404).json({ error: "Training session not found" })
        return
      }

      res.json({ session })
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch training session"
      })
    }
  }

  async makeMove(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params as SessionIdParamDto
      const userId = req.user?.userId

      if (!userId) {
        res.status(401).json({ error: "Authentication required" })
        return
      }

      const { move } = req.body

      if (!move) {
        res.status(400).json({ error: "Move is required" })
        return
      }

      const result = await this.trainingService.makeMove(sessionId, move, userId)
      res.json({ result })
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to make move"
      })
    }
  }

  async endTrainingSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params as SessionIdParamDto
      const userId = req.user?.userId

      if (!userId) {
        res.status(401).json({ error: "Authentication required" })
        return
      }

      const session = await this.trainingService.endSession(sessionId, userId)
      res.json({ session })
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to end training session"
      })
    }
  }

  async pauseTrainingSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params as SessionIdParamDto
      const userId = req.user?.userId

      if (!userId) {
        res.status(401).json({ error: "Authentication required" })
        return
      }

      const session = await this.trainingService.pauseSession(sessionId, userId)
      res.json({ session })
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to pause training session"
      })
    }
  }

  async resumeTrainingSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params as SessionIdParamDto
      const userId = req.user?.userId

      if (!userId) {
        res.status(401).json({ error: "Authentication required" })
        return
      }

      const session = await this.trainingService.resumeSession(sessionId, userId)
      res.json({ session })
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to resume training session"
      })
    }
  }

  async takeBack(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params as SessionIdParamDto
      const userId = req.user?.userId

      if (!userId) {
        res.status(401).json({ error: "Authentication required" })
        return
      }

      const session = await this.trainingService.takeBack(sessionId, userId)
      res.json({ session })
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to take back move"
      })
    }
  }

  async resetPosition(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params as SessionIdParamDto
      const userId = req.user?.userId

      if (!userId) {
        res.status(401).json({ error: "Authentication required" })
        return
      }

      const session = await this.trainingService.resetPosition(sessionId, userId)
      res.json({ session })
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to reset position"
      })
    }
  }

  async getUserSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "Authentication required" })
        return
      }

      const { status } = req.query as unknown as UserSessionsQueryDto
      const sessions = await this.trainingService.getUserSessions(userId, status as any)
      res.json({ sessions })
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch user sessions"
      })
    }
  }

  // Progress tracking endpoints

  async getProgress(req: Request, res: Response): Promise<void> {
    try {
      const { repertoireId, nodeId } = req.params as RepertoireAndNodeIdParamDto
      const userId = req.user?.userId

      if (!userId) {
        res.status(401).json({ error: "Authentication required" })
        return
      }

      const progress = await this.progressService.getProgress(userId, repertoireId, nodeId)
      res.json({ progress })
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch progress"
      })
    }
  }

  async getRepertoireProgress(req: Request, res: Response): Promise<void> {
    try {
      const { repertoireId } = req.params as RepertoireIdParamDto
      const userId = req.user?.userId

      if (!userId) {
        res.status(401).json({ error: "Authentication required" })
        return
      }

      const progress = await this.progressService.getRepertoireProgress(userId, repertoireId)
      res.json({ progress })
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch repertoire progress"
      })
    }
  }

  async getPositionsDueForReview(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "Authentication required" })
        return
      }

      const { repertoireId } = req.query as unknown as PositionsDueQueryDto
      const positions = await this.progressService.getPositionsDueForReview(userId, repertoireId)
      res.json({ positions })
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch positions due for review"
      })
    }
  }

  async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "Authentication required" })
        return
      }

      const stats = await this.progressService.getUserStats(userId)
      res.json({ stats })
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch user stats"
      })
    }
  }

  static build(): OpeningController {
    const openingService = OpeningService.build()
    const progressService = ProgressService.build()
    const trainingService = TrainingService.build(progressService, openingService)

    return new OpeningController(openingService, trainingService, progressService)
  }
}
