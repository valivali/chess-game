import { ChessDataProviderType } from "@/types/opening-types"

export interface ProvidersConfig {
  chessData: {
    /** Default chess data provider */
    defaultProvider: ChessDataProviderType
    /** Provider-specific configurations */
    providers: {
      lichess: {
        /** API token (if required for higher rate limits) */
        apiToken?: string
        /** Custom base URL (if using a proxy) */
        baseUrl?: string
        /** Rate limiting configuration */
        rateLimit: {
          requestsPerMinute: number
          requestsPerHour: number
        }
      }
      chesscom: {
        /** Chess.com API configuration (when implemented) */
        apiKey?: string
        baseUrl?: string
      }
      chessgames: {
        /** ChessGames.com API configuration (when implemented) */
        apiKey?: string
        baseUrl?: string
      }
    }
  }
}

export const providersConfig: ProvidersConfig = {
  chessData: {
    defaultProvider: (process.env.CHESS_DATA_PROVIDER as ChessDataProviderType) || "lichess",
    providers: {
      lichess: {
        apiToken: process.env.LICHESS_API_TOKEN || "",
        baseUrl: process.env.LICHESS_BASE_URL || "https://explorer.lichess.ovh",
        rateLimit: {
          requestsPerMinute: parseInt(process.env.LICHESS_RATE_LIMIT_PER_MINUTE || "60", 10),
          requestsPerHour: parseInt(process.env.LICHESS_RATE_LIMIT_PER_HOUR || "3600", 10)
        }
      },
      chesscom: {
        apiKey: process.env.CHESSCOM_API_KEY || "",
        baseUrl: process.env.CHESSCOM_BASE_URL || "https://api.chess.com"
      },
      chessgames: {
        apiKey: process.env.CHESSGAMES_API_KEY || "",
        baseUrl: process.env.CHESSGAMES_BASE_URL || ""
      }
    }
  }
}
