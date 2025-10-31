import type {
  CreateTrainingSessionRequest,
  CreateTrainingSessionResponse,
  GetRepertoiresResponse,
  ImportPgnRequest,
  ImportPgnResponse,
  MakeMoveResponse,
  OpeningMove,
  OpeningProgress,
  OpeningRepertoire,
  TrainingSession
} from "../types/opening.types"
import { apiClient } from "./apiClient"

export const openingApi = {
  async getUserRepertoires(): Promise<GetRepertoiresResponse> {
    const response = await apiClient.get("/api/opening/repertoires")
    return response.data
  },

  async getRepertoire(repertoireId: string): Promise<{ repertoire: OpeningRepertoire }> {
    const response = await apiClient.get(`/api/opening/repertoires/${repertoireId}`)
    return response.data
  },

  async createRepertoire(
    repertoire: Omit<OpeningRepertoire, "id" | "createdAt" | "updatedAt">
  ): Promise<{ repertoire: OpeningRepertoire }> {
    const response = await apiClient.post("/api/opening/repertoires", repertoire)
    return response.data
  },

  async updateRepertoire(repertoireId: string, updates: Partial<OpeningRepertoire>): Promise<{ repertoire: OpeningRepertoire }> {
    const response = await apiClient.put(`/api/opening/repertoires/${repertoireId}`, updates)
    return response.data
  },

  async deleteRepertoire(repertoireId: string): Promise<void> {
    await apiClient.delete(`/api/opening/repertoires/${repertoireId}`)
  },

  async importFromPgn(request: ImportPgnRequest): Promise<ImportPgnResponse> {
    const response = await apiClient.post("/api/opening/repertoires/import/pgn", request)
    return response.data
  },

  async getPublicRepertoires(tags?: string[], limit?: number, offset?: number): Promise<GetRepertoiresResponse> {
    const params = new URLSearchParams()
    if (tags) tags.forEach((tag) => params.append("tags", tag))
    if (limit) params.append("limit", limit.toString())
    if (offset) params.append("offset", offset.toString())

    const response = await apiClient.get(`/api/opening/repertoires/public?${params.toString()}`)
    return response.data
  },

  async startTrainingSession(request: CreateTrainingSessionRequest): Promise<CreateTrainingSessionResponse> {
    const response = await apiClient.post("/api/opening/training/sessions", request)
    return response.data
  },

  async getTrainingSession(sessionId: string): Promise<{ session: TrainingSession }> {
    const response = await apiClient.get(`/api/opening/training/sessions/${sessionId}`)
    return response.data
  },

  async makeMove(sessionId: string, move: OpeningMove): Promise<MakeMoveResponse> {
    const response = await apiClient.post(`/api/opening/training/sessions/${sessionId}/moves`, { move })
    return response.data
  },

  async endTrainingSession(sessionId: string): Promise<{ session: TrainingSession }> {
    const response = await apiClient.post(`/api/opening/training/sessions/${sessionId}/end`)
    return response.data
  },

  async pauseTrainingSession(sessionId: string): Promise<{ session: TrainingSession }> {
    const response = await apiClient.post(`/api/opening/training/sessions/${sessionId}/pause`)
    return response.data
  },

  async resumeTrainingSession(sessionId: string): Promise<{ session: TrainingSession }> {
    const response = await apiClient.post(`/api/opening/training/sessions/${sessionId}/resume`)
    return response.data
  },

  async takeBack(sessionId: string): Promise<{ session: TrainingSession }> {
    const response = await apiClient.post(`/api/opening/training/sessions/${sessionId}/takeback`)
    return response.data
  },

  async resetPosition(sessionId: string): Promise<{ session: TrainingSession }> {
    const response = await apiClient.post(`/api/opening/training/sessions/${sessionId}/reset`)
    return response.data
  },

  async getUserSessions(status?: TrainingSession["status"]): Promise<{ sessions: TrainingSession[] }> {
    const params = status ? `?status=${status}` : ""
    const response = await apiClient.get(`/api/opening/training/sessions${params}`)
    return response.data
  },

  async updateSessionSettings(sessionId: string, settings: Partial<TrainingSession["settings"]>): Promise<{ session: TrainingSession }> {
    const response = await apiClient.put(`/api/opening/training/sessions/${sessionId}/settings`, { settings })
    return response.data
  },

  async getProgress(repertoireId: string, nodeId: string): Promise<{ progress: OpeningProgress | null }> {
    const response = await apiClient.get(`/api/opening/progress/repertoires/${repertoireId}/nodes/${nodeId}`)
    return response.data
  },

  async getRepertoireProgress(repertoireId: string): Promise<{ progress: OpeningProgress[] }> {
    const response = await apiClient.get(`/api/opening/progress/repertoires/${repertoireId}`)
    return response.data
  },

  async getPositionsDueForReview(repertoireId?: string): Promise<{ positions: OpeningProgress[] }> {
    const params = repertoireId ? `?repertoireId=${repertoireId}` : ""
    const response = await apiClient.get(`/api/opening/progress/review${params}`)
    return response.data
  },

  async getUserStats(): Promise<{
    stats: {
      totalPositions: number
      positionsLearned: number
      averageEaseFactor: number
      longestStreak: number
      positionsDueToday: number
    }
  }> {
    const response = await apiClient.get("/api/opening/progress/stats")
    return response.data
  }
}
