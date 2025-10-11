export interface JwtConfigInterface {
  jwtSecret: string
  jwtRefreshSecret: string
  accessTokenExpiry: string
  refreshTokenExpiry: string
}

export class JwtConfig implements JwtConfigInterface {
  readonly jwtSecret: string
  readonly jwtRefreshSecret: string
  readonly accessTokenExpiry: string
  readonly refreshTokenExpiry: string

  constructor() {
    this.jwtSecret = this.getRequiredEnvVar("JWT_SECRET")
    this.jwtRefreshSecret = this.getRequiredEnvVar("JWT_REFRESH_SECRET")
    this.accessTokenExpiry = this.getRequiredEnvVar("JWT_EXPIRES_IN")
    this.refreshTokenExpiry = this.getRequiredEnvVar("JWT_REFRESH_EXPIRES_IN")
  }

  private getRequiredEnvVar(name: string): string {
    const value = process.env[name]
    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`)
    }
    return value
  }

  static build(): JwtConfig {
    return new JwtConfig()
  }
}
