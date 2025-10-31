import { match } from "ts-pattern"
import { ChessDataProviderInterface } from "./ChessDataProviderInterface"
import { LichessProvider } from "./LichessProvider"
import { ChessDataProviderType, CHESS_DATA_PROVIDER_TYPE } from "@/types/opening-types"

export class ChessDataProviderFactory {
  static createProvider(type: ChessDataProviderType): ChessDataProviderInterface {
    return match(type)
      .with(CHESS_DATA_PROVIDER_TYPE.LICHESS, () => LichessProvider.build())
      .with(CHESS_DATA_PROVIDER_TYPE.CHESSCOM, () => {
        throw new Error("Chess.com provider not yet implemented")
      })
      .with(CHESS_DATA_PROVIDER_TYPE.CHESSGAMES, () => {
        throw new Error("ChessGames.com provider not yet implemented")
      })
      .exhaustive()
  }

  static getDefaultProvider(): ChessDataProviderInterface {
    const providerType = (process.env.CHESS_DATA_PROVIDER as ChessDataProviderType) || CHESS_DATA_PROVIDER_TYPE.LICHESS
    return this.createProvider(providerType)
  }

  static getAvailableProviders(): ChessDataProviderType[] {
    return [CHESS_DATA_PROVIDER_TYPE.LICHESS]
  }

  static isProviderAvailable(type: ChessDataProviderType): boolean {
    return this.getAvailableProviders().includes(type)
  }
}
