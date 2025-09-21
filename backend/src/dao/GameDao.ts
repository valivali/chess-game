import { Game } from "@/types/gameTypes"
import { GameModel, GameDocument } from "@/models/GameModel"

export interface IGameDao {
  create(game: Omit<Game, "id">): Promise<Game>
  findById(id: string): Promise<Game | null>
  update(id: string, updates: Partial<Omit<Game, "id">>): Promise<Game | null>
  delete(id: string): Promise<boolean>
  findAll(): Promise<Game[]>
}

export class GameDao implements IGameDao {
  async create(gameData: Omit<Game, "id">): Promise<Game> {
    const gameDocument = new GameModel(gameData)
    const savedGame = await gameDocument.save()
    return this.documentToGame(savedGame)
  }

  async findById(id: string): Promise<Game | null> {
    const gameDocument = await GameModel.findById(id).exec()
    return gameDocument ? this.documentToGame(gameDocument) : null
  }

  async update(id: string, updates: Partial<Omit<Game, "id">>): Promise<Game | null> {
    const gameDocument = await GameModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).exec()

    return gameDocument ? this.documentToGame(gameDocument) : null
  }

  async delete(id: string): Promise<boolean> {
    const result = await GameModel.findByIdAndDelete(id).exec()
    return result !== null
  }

  async findAll(): Promise<Game[]> {
    const gameDocuments = await GameModel.find().exec()
    return gameDocuments.map((doc) => this.documentToGame(doc))
  }

  private documentToGame(document: GameDocument): Game {
    return {
      id: document._id.toString(),
      board: document.board,
      currentPlayer: document.currentPlayer,
      status: document.status,
      winner: document.winner,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    }
  }

  static build(): GameDao {
    return new GameDao()
  }
}
