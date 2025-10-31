import { OpeningRepertoire, PgnImportResult } from "@/types/opening-types"

export interface OpeningServiceInterface {
  /**
   * Create a new opening repertoire
   */
  createRepertoire(repertoire: Omit<OpeningRepertoire, "id" | "createdAt" | "updatedAt">): Promise<OpeningRepertoire>

  /**
   * Get repertoires for a user
   */
  getUserRepertoires(userId: string): Promise<OpeningRepertoire[]>

  /**
   * Get a specific repertoire by ID
   */
  getRepertoire(repertoireId: string, userId?: string): Promise<OpeningRepertoire | null>

  /**
   * Update an existing repertoire
   */
  updateRepertoire(repertoireId: string, updates: Partial<OpeningRepertoire>, userId: string): Promise<OpeningRepertoire>

  /**
   * Delete a repertoire
   */
  deleteRepertoire(repertoireId: string, userId: string): Promise<boolean>

  /**
   * Import repertoire from PGN
   */
  importFromPgn(pgn: string, name: string, userId: string, color: "white" | "black", description?: string): Promise<PgnImportResult>

  /**
   * Get public repertoires
   */
  getPublicRepertoires(tags?: string[], limit?: number, offset?: number): Promise<OpeningRepertoire[]>
}
