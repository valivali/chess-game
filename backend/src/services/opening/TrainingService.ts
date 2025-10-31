import { TrainingServiceInterface } from "./trainingService.interface"
import { ProgressServiceInterface } from "./progressService.interface"
import { OpeningServiceInterface } from "./openingService.interface"
import { MoveTrainingResult, OpeningMove, OpeningNode, TrainingSession } from "@/types/opening-types"
import { TrainingSessionModel } from "@/models"

export class TrainingService implements TrainingServiceInterface {
  constructor(
    private readonly progressService: ProgressServiceInterface,
    private readonly openingService: OpeningServiceInterface
  ) {}

  async startSession(
    userId: string,
    repertoireId: string,
    mode: TrainingSession["mode"],
    settings?: Partial<TrainingSession["settings"]>
  ): Promise<TrainingSession> {
    const repertoire = await this.openingService.getRepertoire(repertoireId, userId)
    if (!repertoire) {
      throw new Error("Repertoire not found")
    }

    const defaultSettings: TrainingSession["settings"] = {
      showHints: true,
      allowTakebacks: true,
      timeLimit: 0,
      includeSidelines: false
    }

    const session: Omit<TrainingSession, "id"> = {
      repertoireId,
      userId,
      currentNodeId: repertoire.rootNode.id,
      movePath: [],
      currentFen: repertoire.rootNode.fen,
      isUserTurn: this.isUserTurnToMove(repertoire.rootNode, repertoire.color),
      score: 0,
      correctMoves: 0,
      incorrectMoves: 0,
      startTime: new Date(),
      status: "active",
      mode,
      settings: { ...defaultSettings, ...settings }
    }

    const sessionDoc = new TrainingSessionModel(session)
    const savedSession = await sessionDoc.save()
    return savedSession.toJSON() as TrainingSession
  }

  async getSession(sessionId: string, userId: string): Promise<TrainingSession | null> {
    const session = await TrainingSessionModel.findOne({
      _id: sessionId,
      userId
    }).exec()

    return session ? (session.toJSON() as TrainingSession) : null
  }

  async makeMove(sessionId: string, move: OpeningMove, userId: string): Promise<MoveTrainingResult> {
    const session = await this.getSession(sessionId, userId)
    if (!session) {
      throw new Error("Training session not found")
    }

    if (session.status !== "active") {
      throw new Error("Training session is not active")
    }

    const repertoire = await this.openingService.getRepertoire(session.repertoireId, userId)
    if (!repertoire) {
      throw new Error("Repertoire not found")
    }

    const currentNode = this.findNodeById(repertoire.rootNode, session.currentNodeId)
    if (!currentNode) {
      throw new Error("Current position not found in repertoire")
    }

    const validationResult = this.validateMove(move, currentNode, session.settings.includeSidelines)

    if (validationResult.isCorrect && validationResult.nextNode) {
      await this.progressService.updateProgress(userId, session.repertoireId, validationResult.nextNode.id, true)
    } else if (!validationResult.isCorrect) {
      await this.progressService.updateProgress(userId, session.repertoireId, session.currentNodeId, false)
    }

    const updatedSession = await this.updateSessionAfterMove(session, validationResult, repertoire.color)

    return {
      isCorrect: validationResult.isCorrect,
      attemptedMove: move,
      expectedMoves: validationResult.expectedMoves,
      feedback: validationResult.feedback,
      session: updatedSession,
      nextFen: validationResult.nextFen,
      isLineComplete: validationResult.isLineComplete,
      ...(validationResult.suggestion !== undefined && { suggestion: validationResult.suggestion })
    }
  }

  async endSession(sessionId: string, userId: string): Promise<TrainingSession> {
    const session = await TrainingSessionModel.findOneAndUpdate({ _id: sessionId, userId }, { status: "completed" }, { new: true }).exec()

    if (!session) {
      throw new Error("Training session not found")
    }

    return session.toJSON() as TrainingSession
  }

  async pauseSession(sessionId: string, userId: string): Promise<TrainingSession> {
    const session = await TrainingSessionModel.findOneAndUpdate({ _id: sessionId, userId }, { status: "paused" }, { new: true }).exec()

    if (!session) {
      throw new Error("Training session not found")
    }

    return session.toJSON() as TrainingSession
  }

  async resumeSession(sessionId: string, userId: string): Promise<TrainingSession> {
    const session = await TrainingSessionModel.findOneAndUpdate({ _id: sessionId, userId }, { status: "active" }, { new: true }).exec()

    if (!session) {
      throw new Error("Training session not found")
    }

    return session.toJSON() as TrainingSession
  }

  async takeBack(sessionId: string, userId: string): Promise<TrainingSession> {
    const session = await this.getSession(sessionId, userId)
    if (!session) {
      throw new Error("Training session not found")
    }

    if (!session.settings.allowTakebacks) {
      throw new Error("Takebacks are not allowed in this session")
    }

    if (session.movePath.length === 0) {
      throw new Error("No moves to take back")
    }

    const repertoire = await this.openingService.getRepertoire(session.repertoireId, userId)
    if (!repertoire) {
      throw new Error("Repertoire not found")
    }

    const newMovePath = session.movePath.slice(0, -1)
    const newCurrentNodeId = newMovePath.length > 0 ? this.getNodeIdFromPath(repertoire.rootNode, newMovePath) : repertoire.rootNode.id

    const newCurrentNode = this.findNodeById(repertoire.rootNode, newCurrentNodeId)
    if (!newCurrentNode) {
      throw new Error("Cannot find previous position")
    }

    const updatedSession = await TrainingSessionModel.findOneAndUpdate(
      { _id: sessionId, userId },
      {
        currentNodeId: newCurrentNodeId,
        movePath: newMovePath,
        currentFen: newCurrentNode.fen,
        isUserTurn: this.isUserTurnToMove(newCurrentNode, repertoire.color)
      },
      { new: true }
    ).exec()

    if (!updatedSession) {
      throw new Error("Failed to update session")
    }

    return updatedSession.toJSON() as TrainingSession
  }

  async resetPosition(sessionId: string, userId: string): Promise<TrainingSession> {
    const session = await this.getSession(sessionId, userId)
    if (!session) {
      throw new Error("Training session not found")
    }

    const repertoire = await this.openingService.getRepertoire(session.repertoireId, userId)
    if (!repertoire) {
      throw new Error("Repertoire not found")
    }

    const updatedSession = await TrainingSessionModel.findOneAndUpdate(
      { _id: sessionId, userId },
      {
        currentNodeId: repertoire.rootNode.id,
        movePath: [],
        currentFen: repertoire.rootNode.fen,
        isUserTurn: this.isUserTurnToMove(repertoire.rootNode, repertoire.color)
      },
      { new: true }
    ).exec()

    if (!updatedSession) {
      throw new Error("Failed to update session")
    }

    return updatedSession.toJSON() as TrainingSession
  }

  async getUserSessions(userId: string, status?: TrainingSession["status"]): Promise<TrainingSession[]> {
    const query = status ? { userId, status } : { userId }
    const sessions = await TrainingSessionModel.find(query).sort({ startTime: -1 }).exec()

    return sessions.map(session => session.toJSON() as TrainingSession)
  }

  async updateSessionSettings(sessionId: string, settings: Partial<TrainingSession["settings"]>, userId: string): Promise<TrainingSession> {
    const session = await TrainingSessionModel.findOneAndUpdate({ _id: sessionId, userId }, { $set: { settings } }, { new: true }).exec()

    if (!session) {
      throw new Error("Training session not found")
    }

    return session.toJSON() as TrainingSession
  }

  private validateMove(
    move: OpeningMove,
    currentNode: OpeningNode,
    includeSidelines: boolean
  ): {
    isCorrect: boolean
    expectedMoves: OpeningMove[]
    feedback: string
    nextNode?: OpeningNode
    nextFen: string
    isLineComplete: boolean
    suggestion?: { move: OpeningMove; explanation: string } | undefined
  } {
    const expectedMoves = this.getExpectedMoves(currentNode, includeSidelines)

    if (expectedMoves.length === 0) {
      return {
        isCorrect: false,
        expectedMoves: [],
        feedback: "This opening line is complete. No more moves in the repertoire.",
        nextFen: currentNode.fen,
        isLineComplete: true,
        suggestion: undefined
      }
    }

    const matchingChild = currentNode.children.find(child => child.move && this.movesEqual(move, child.move))

    if (matchingChild) {
      const feedback = matchingChild.comment || "Correct move!"
      return {
        isCorrect: true,
        expectedMoves,
        feedback,
        nextNode: matchingChild,
        nextFen: matchingChild.fen,
        isLineComplete: matchingChild.children.length === 0
      }
    }

    const mainLineMove = currentNode.children.find(child => child.isMainLine)
    const bestMove = mainLineMove || currentNode.children[0]

    return {
      isCorrect: false,
      expectedMoves,
      feedback: `Incorrect move. The repertoire suggests ${expectedMoves[0]?.san || "a different move"}.`,
      nextFen: currentNode.fen,
      isLineComplete: false,
      suggestion: bestMove?.move
        ? {
            move: bestMove.move,
            explanation: bestMove.comment || "This is the recommended move from your repertoire."
          }
        : undefined
    }
  }

  private getExpectedMoves(node: OpeningNode, includeSidelines: boolean): OpeningMove[] {
    if (includeSidelines) {
      return node.children
        .filter(child => child.move)
        .map(child => child.move!)
        .sort((a, b) => {
          const aChild = node.children.find(c => c.move && this.movesEqual(a, c.move))
          const bChild = node.children.find(c => c.move && this.movesEqual(b, c.move))
          return (bChild?.priority || 0) - (aChild?.priority || 0)
        })
    }

    return node.children.filter(child => child.move && child.isMainLine).map(child => child.move!)
  }

  private movesEqual(move1: OpeningMove, move2: OpeningMove): boolean {
    return (
      move1.uci === move2.uci ||
      (move1.from.x === move2.from.x && move1.from.y === move2.from.y && move1.to.x === move2.to.x && move1.to.y === move2.to.y)
    )
  }

  private findNodeById(rootNode: OpeningNode, nodeId: string): OpeningNode | null {
    if (rootNode.id === nodeId) {
      return rootNode
    }

    for (const child of rootNode.children) {
      const found = this.findNodeById(child, nodeId)
      if (found) {
        return found
      }
    }

    return null
  }

  private getNodeIdFromPath(rootNode: OpeningNode, movePath: string[]): string {
    let currentNode = rootNode

    for (const moveUci of movePath) {
      const child = currentNode.children.find(c => c.move?.uci === moveUci)
      if (!child) {
        throw new Error(`Move ${moveUci} not found in repertoire`)
      }
      currentNode = child
    }

    return currentNode.id
  }

  private isUserTurnToMove(node: OpeningNode, repertoireColor: "white" | "black"): boolean {
    const fenParts = node.fen.split(" ")
    const activeColor = fenParts[1]

    return (repertoireColor === "white" && activeColor === "w") || (repertoireColor === "black" && activeColor === "b")
  }

  private async updateSessionAfterMove(
    session: TrainingSession,
    validationResult: {
      isCorrect: boolean
      nextNode?: OpeningNode
      nextFen: string
    },
    repertoireColor: "white" | "black"
  ): Promise<TrainingSession> {
    const updates: Partial<TrainingSession> = {
      score: session.score + (validationResult.isCorrect ? 10 : -5),
      correctMoves: session.correctMoves + (validationResult.isCorrect ? 1 : 0),
      incorrectMoves: session.incorrectMoves + (validationResult.isCorrect ? 0 : 1)
    }

    if (validationResult.isCorrect && validationResult.nextNode) {
      updates.currentNodeId = validationResult.nextNode.id
      updates.movePath = [...session.movePath, validationResult.nextNode.move!.uci]
      updates.currentFen = validationResult.nextFen
      updates.isUserTurn = this.isUserTurnToMove(validationResult.nextNode, repertoireColor)
    }

    const updatedSession = await TrainingSessionModel.findOneAndUpdate({ _id: session.id }, { $set: updates }, { new: true }).exec()

    if (!updatedSession) {
      throw new Error("Failed to update session")
    }

    return updatedSession.toJSON() as TrainingSession
  }

  static build(progressService: ProgressServiceInterface, openingService: OpeningServiceInterface): TrainingService {
    return new TrainingService(progressService, openingService)
  }
}
