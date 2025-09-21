interface CreateGameResponse {
  success: boolean
  data: {
    game: {
      id: string
      board: (string | null)[][]
      currentPlayer: string
      status: string
      winner: string | null
      createdAt: string
      updatedAt: string
    }
  }
  message: string
}

interface CreateGameRequest {
  playerName: string
}

class GameService {
  private readonly baseUrl: string

  constructor() {
    // Use environment variable for API URL, with fallback for development
    this.baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001/api"
  }

  async createGame(playerName: string): Promise<CreateGameResponse> {
    const response = await fetch(`${this.baseUrl}/game/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ playerName } as CreateGameRequest)
    })

    if (!response.ok) {
      throw new Error(`Failed to create game: ${response.statusText}`)
    }

    return await response.json()
  }
}

export const gameService = new GameService()
export type { CreateGameResponse, CreateGameRequest }
