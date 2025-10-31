import { v4 as uuidv4 } from "uuid"
import { OpeningServiceInterface } from "./openingService.interface"
import { OpeningMove, OpeningNode, OpeningRepertoire, PgnImportResult } from "@/types/opening-types"
import { OpeningRepertoireModel } from "@/models"

export class OpeningService implements OpeningServiceInterface {
  constructor() {}

  async createRepertoire(repertoire: Omit<OpeningRepertoire, "id" | "createdAt" | "updatedAt">): Promise<OpeningRepertoire> {
    // Ensure the root node has a proper ID and structure
    const processedRepertoire = {
      ...repertoire,
      rootNode: this.processOpeningNode(repertoire.rootNode),
      metadata: {
        ...repertoire.metadata,
        totalPositions: this.countNodes(repertoire.rootNode),
        maxDepth: this.calculateMaxDepth(repertoire.rootNode)
      }
    }

    const repertoireDoc = new OpeningRepertoireModel(processedRepertoire)
    const savedRepertoire = await repertoireDoc.save()
    return savedRepertoire.toJSON() as OpeningRepertoire
  }

  async getUserRepertoires(userId: string): Promise<OpeningRepertoire[]> {
    const repertoires = await OpeningRepertoireModel.find({ userId }).sort({ updatedAt: -1 }).exec()

    return repertoires.map(rep => rep.toJSON() as OpeningRepertoire)
  }

  async getRepertoire(repertoireId: string, userId?: string): Promise<OpeningRepertoire | null> {
    const query = userId ? { _id: repertoireId, $or: [{ userId }, { isPublic: true }] } : { _id: repertoireId, isPublic: true }

    const repertoire = await OpeningRepertoireModel.findOne(query).exec()
    return repertoire ? (repertoire.toJSON() as OpeningRepertoire) : null
  }

  async updateRepertoire(repertoireId: string, updates: Partial<OpeningRepertoire>, userId: string): Promise<OpeningRepertoire> {
    if (updates.rootNode) {
      updates.rootNode = this.processOpeningNode(updates.rootNode)

      // Get current repertoire to access existing metadata
      const currentRepertoire = await OpeningRepertoireModel.findOne({ _id: repertoireId, userId }).exec()
      if (!currentRepertoire) {
        throw new Error("Repertoire not found or access denied")
      }

      const currentMetadata = currentRepertoire.toJSON().metadata

      updates.metadata = {
        ...currentMetadata,
        ...updates.metadata,
        totalPositions: this.countNodes(updates.rootNode),
        maxDepth: this.calculateMaxDepth(updates.rootNode),
        version: (currentMetadata?.version || 1) + 1
      }
    }

    const repertoire = await OpeningRepertoireModel.findOneAndUpdate({ _id: repertoireId, userId }, { $set: updates }, { new: true }).exec()

    if (!repertoire) {
      throw new Error("Repertoire not found or access denied")
    }

    return repertoire.toJSON() as OpeningRepertoire
  }

  async deleteRepertoire(repertoireId: string, userId: string): Promise<boolean> {
    const result = await OpeningRepertoireModel.deleteOne({
      _id: repertoireId,
      userId
    }).exec()

    return result.deletedCount > 0
  }

  async importFromPgn(pgn: string, name: string, userId: string, color: "white" | "black", description?: string): Promise<PgnImportResult> {
    try {
      // This is a simplified PGN parser - in a real implementation,
      // you'd use a proper PGN parsing library
      const rootNode = this.parsePgnToOpeningTree(pgn, color)

      const repertoire: Omit<OpeningRepertoire, "id" | "createdAt" | "updatedAt"> = {
        name,
        ...(description !== undefined && { description }),
        color,
        rootNode,
        userId,
        isPublic: false,
        tags: this.extractTagsFromPgn(pgn),
        metadata: {
          totalPositions: this.countNodes(rootNode),
          maxDepth: this.calculateMaxDepth(rootNode),
          source: "pgn_import",
          version: 1
        }
      }

      const createdRepertoire = await this.createRepertoire(repertoire)

      return {
        success: true,
        repertoire: createdRepertoire,
        stats: {
          gamesProcessed: 1, // Simplified - would count actual games in real implementation
          positionsCreated: repertoire.metadata.totalPositions,
          variationsFound: this.countVariations(rootNode)
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to import PGN",
        stats: {
          gamesProcessed: 0,
          positionsCreated: 0,
          variationsFound: 0
        }
      }
    }
  }

  async getPublicRepertoires(tags?: string[], limit = 20, offset = 0): Promise<OpeningRepertoire[]> {
    const query: any = { isPublic: true }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags }
    }

    const repertoires = await OpeningRepertoireModel.find(query).sort({ updatedAt: -1 }).skip(offset).limit(limit).exec()

    return repertoires.map(rep => rep.toJSON() as OpeningRepertoire)
  }

  // Private helper methods

  private processOpeningNode(node: OpeningNode): OpeningNode {
    return {
      ...node,
      id: node.id || uuidv4(),
      children: node.children.map(child => this.processOpeningNode(child)),
      lastUpdated: new Date()
    }
  }

  private countNodes(node: OpeningNode): number {
    return 1 + node.children.reduce((count, child) => count + this.countNodes(child), 0)
  }

  private calculateMaxDepth(node: OpeningNode, currentDepth = 0): number {
    if (node.children.length === 0) {
      return currentDepth
    }

    return Math.max(...node.children.map(child => this.calculateMaxDepth(child, currentDepth + 1)))
  }

  private countVariations(node: OpeningNode): number {
    const variations = node.children.length > 1 ? 1 : 0
    return variations + node.children.reduce((count, child) => count + this.countVariations(child), 0)
  }

  private parsePgnToOpeningTree(pgn: string, color: "white" | "black"): OpeningNode {
    // This is a simplified implementation
    // In a real application, you'd use a proper PGN parser like chess.js or similar

    const rootNode: OpeningNode = {
      id: uuidv4(),
      move: null,
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", // Starting position
      isMainLine: true,
      priority: 10,
      children: [],
      tags: [],
      lastUpdated: new Date()
    }

    // Extract moves from PGN (simplified)
    const movePattern = /\d+\.\s*([a-zA-Z0-9+#=\-]+)(?:\s+([a-zA-Z0-9+#=\-]+))?/g
    const moves: string[] = []
    let match

    while ((match = movePattern.exec(pgn)) !== null) {
      if (match[1]) moves.push(match[1])
      if (match[2]) moves.push(match[2])
    }

    // Build the tree (simplified - just a linear sequence)
    let currentNode = rootNode
    let currentFen = rootNode.fen

    for (let i = 0; i < moves.length; i++) {
      const san = moves[i]

      // In a real implementation, you'd convert SAN to UCI and update FEN properly
      const move: OpeningMove = {
        san: san || "",
        from: { x: 0, y: 0 }, // Placeholder - would be calculated from actual move
        to: { x: 0, y: 0 }, // Placeholder - would be calculated from actual move
        uci: san?.toLowerCase() || "" // Simplified - would be proper UCI
      }

      // Update FEN (simplified - would use proper chess engine)
      currentFen = this.updateFenAfterMove(currentFen, move)

      const childNode: OpeningNode = {
        id: uuidv4(),
        move,
        fen: currentFen,
        isMainLine: true,
        priority: 10,
        children: [],
        tags: [],
        lastUpdated: new Date()
      }

      currentNode.children.push(childNode)
      currentNode = childNode
    }

    return rootNode
  }

  private extractTagsFromPgn(pgn: string): string[] {
    const tags: string[] = []

    // Extract opening name from Event or Opening tags
    const eventMatch = pgn.match(/\[Event\s+"([^"]+)"\]/)
    if (eventMatch) {
      tags.push(eventMatch[1] || "")
    }

    const openingMatch = pgn.match(/\[Opening\s+"([^"]+)"\]/)
    if (openingMatch) {
      tags.push(openingMatch[1] || "")
    }

    return tags
  }

  private updateFenAfterMove(fen: string, move: OpeningMove): string {
    // This is a placeholder implementation
    // In a real application, you'd use a proper chess engine to update the FEN
    // For now, just return a modified FEN to indicate a move was made
    const parts = fen.split(" ")
    const moveNumber = parseInt(parts[5] || "0") + 1
    const activeColor = parts[1] === "w" ? "b" : "w"

    return `${parts[0]} ${activeColor} ${parts[2]} ${parts[3]} ${parts[4]} ${moveNumber}`
  }

  static build(): OpeningService {
    return new OpeningService()
  }
}
