export interface User {
  id: string
  email: string
  username: string
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface UserStats {
  gamesPlayed: number
  gamesWon: number
  gamesLost: number
  gamesDrawn: number
  winRate: number
  currentRating: number
  highestRating: number
  averageGameDuration: number
}

export interface UserProfile extends User {
  stats: UserStats
  preferences: UserPreferences
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto"
  boardStyle: "classic" | "modern" | "wood"
  pieceStyle: "classic" | "modern" | "medieval"
  soundEnabled: boolean
  animationsEnabled: boolean
}
