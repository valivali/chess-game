import { Game } from "@/types/gameTypes"

type CreateGameData = Omit<Game, "id" | "whitePlayerId" | "blackPlayerId" | "playerName"> & {
  whitePlayerId?: string
  blackPlayerId?: string
  playerName?: string
}

export interface GameDaoInterface {
  create(game: CreateGameData): Promise<Game>
  findById(id: string): Promise<Game | null>
  update(id: string, updates: Partial<Omit<Game, "id">>): Promise<Game | null>
  delete(id: string): Promise<boolean>
  findAll(): Promise<Game[]>
}
